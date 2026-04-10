// State Management
const State = {
    currentView: 'dashboard',
    shop: JSON.parse(localStorage.getItem('barber_shop')) || {
        name: 'Barber Pro',
        phone: '',
        address: '',
        instagram: ''
    },
    services: JSON.parse(localStorage.getItem('barber_services')) || [
        { id: 1, name: 'Corte Social', price: 35, duration: 30 },
        { id: 2, name: 'Barba Completa', price: 25, duration: 20 },
        { id: 3, name: 'Corte + Barba', price: 50, duration: 50 }
    ],
    barbers: JSON.parse(localStorage.getItem('barber_barbers')) || [
        { id: 1, name: 'Ricardo Navalha', specialty: 'Barba & Corte' },
        { id: 2, name: 'Júnior Style', specialty: 'Degradê & Pigmentação' }
    ],
    appointments: JSON.parse(localStorage.getItem('barber_appointments')) || [],
    bookingData: {
        service: null,
        barber: null,
        date: null,
        time: null
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initShopProfile();
    initServices();
    initBarbers();
    initBookingWizard();
    renderDashboard();
});

// --- Navigation Logic ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
        });
    });
}

function switchView(viewId) {
    // Update Nav UI
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');

    // Update View UI
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    State.currentView = viewId;
    
    // Refresh data if needed
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'services') renderServicesList();
    if (viewId === 'barbers') renderBarbersList();
    if (viewId === 'booking') startBookingWizard();
}

// --- Shop Profile Logic ---
function initShopProfile() {
    const form = document.getElementById('shop-form');
    
    // Set initial values
    document.getElementById('shop-name').value = State.shop.name;
    document.getElementById('shop-phone').value = State.shop.phone;
    document.getElementById('shop-address').value = State.shop.address;
    document.getElementById('shop-instagram').value = State.shop.instagram;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        State.shop = {
            name: document.getElementById('shop-name').value,
            phone: document.getElementById('shop-phone').value,
            address: document.getElementById('shop-address').value,
            instagram: document.getElementById('shop-instagram').value
        };
        localStorage.setItem('barber_shop', JSON.stringify(State.shop));
        updateLogoText();
        alert('Perfil atualizado com sucesso!');
    });
}

function updateLogoText() {
    const logoSpan = document.querySelector('.logo span');
    logoSpan.textContent = State.shop.name || 'Barber Pro';
}

// --- Services Logic ---
function initServices() {
    const addBtn = document.getElementById('add-service-btn');
    const modal = document.getElementById('service-modal');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('service-form');

    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Novo Serviço';
        form.reset();
        document.getElementById('service-id').value = '';
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('service-id').value;
        const serviceData = {
            name: document.getElementById('service-name').value,
            price: document.getElementById('service-price').value,
            duration: document.getElementById('service-duration').value
        };

        if (id) {
            // Edit
            const index = State.services.findIndex(s => s.id == id);
            State.services[index] = { ...serviceData, id: parseInt(id) };
        } else {
            // New
            serviceData.id = Date.now();
            State.services.push(serviceData);
        }

        saveServices();
        renderServicesList();
        modal.classList.remove('active');
    });

    renderServicesList();
}

function saveServices() {
    localStorage.setItem('barber_services', JSON.stringify(State.services));
}

function renderServicesList() {
    const list = document.getElementById('services-list');
    if (State.services.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim);">Nenhum serviço cadastrado.</p>';
        return;
    }

    list.innerHTML = State.services.map(s => `
        <div class="list-item">
            <div class="item-info">
                <h4>${s.name}</h4>
                <p>${s.duration} min • R$ ${s.price}</p>
            </div>
            <div class="item-actions">
                <button class="action-btn" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteService(${s.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.editService = (id) => {
    const service = State.services.find(s => s.id == id);
    document.getElementById('modal-title').textContent = 'Editar Serviço';
    document.getElementById('service-id').value = service.id;
    document.getElementById('service-name').value = service.name;
    document.getElementById('service-price').value = service.price;
    document.getElementById('service-duration').value = service.duration;
    document.getElementById('service-modal').classList.add('active');
};

window.deleteService = (id) => {
    if (confirm('Deseja excluir este serviço?')) {
        State.services = State.services.filter(s => s.id != id);
        saveServices();
        renderServicesList();
    }
};

// --- Barbers Logic ---
function initBarbers() {
    const addBtn = document.getElementById('add-barber-btn');
    const modal = document.getElementById('barber-modal');
    const form = document.getElementById('barber-form');
    const closeBtns = document.querySelectorAll('.close-modal');

    addBtn.addEventListener('click', () => {
        document.getElementById('barber-modal-title').textContent = 'Novo Profissional';
        form.reset();
        document.getElementById('barber-id').value = '';
        modal.classList.add('active');
    });

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('barber-id').value;
        const barberData = {
            name: document.getElementById('barber-name').value,
            specialty: document.getElementById('barber-specialty').value
        };

        if (id) {
            const index = State.barbers.findIndex(b => b.id == id);
            State.barbers[index] = { ...barberData, id: parseInt(id) };
        } else {
            barberData.id = Date.now();
            State.barbers.push(barberData);
        }

        saveBarbers();
        renderBarbersList();
        modal.classList.remove('active');
    });

    renderBarbersList();
}

function saveBarbers() {
    localStorage.setItem('barber_barbers', JSON.stringify(State.barbers));
}

function renderBarbersList() {
    const list = document.getElementById('barbers-list');
    if (State.barbers.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim);">Nenhum profissional cadastrado.</p>';
        return;
    }

    list.innerHTML = State.barbers.map(b => `
        <div class="list-item">
            <div class="item-info">
                <h4>${b.name}</h4>
                <p>${b.specialty}</p>
            </div>
            <div class="item-actions">
                <button class="action-btn" onclick="editBarber(${b.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteBarber(${b.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.editBarber = (id) => {
    const barber = State.barbers.find(b => b.id == id);
    document.getElementById('barber-modal-title').textContent = 'Editar Profissional';
    document.getElementById('barber-id').value = barber.id;
    document.getElementById('barber-name').value = barber.name;
    document.getElementById('barber-specialty').value = barber.specialty;
    document.getElementById('barber-modal').classList.add('active');
};

window.deleteBarber = (id) => {
    if (confirm('Deseja excluir este profissional?')) {
        State.barbers = State.barbers.filter(b => b.id != id);
        saveBarbers();
        renderBarbersList();
    }
};

// --- Dashboard Logic ---
function renderDashboard() {
    const list = document.getElementById('appointments-list');
    const header = document.querySelector('#dashboard .header');
    
    // Stats calculation
    const today = new Date().toLocaleDateString();
    const todayApps = State.appointments.filter(a => a.date === today);
    const totalRevenue = todayApps.reduce((acc, curr) => acc + (parseFloat(curr.servicePrice) || 0), 0);

    header.innerHTML = `
        <h1>Olá, Barbeiro!</h1>
        <div style="display: flex; gap: 20px; margin-top: 1rem; flex-wrap: wrap;">
            <div class="card" style="margin-bottom:0; flex:1; min-width: 200px; padding: 1.5rem;">
                <p style="color:var(--text-dim); font-size: 0.9rem;">Agendamentos Hoje</p>
                <h2 style="color: var(--primary);">${todayApps.length}</h2>
            </div>
            <div class="card" style="margin-bottom:0; flex:1; min-width: 200px; padding: 1.5rem;">
                <p style="color:var(--text-dim); font-size: 0.9rem;">Receita Estimada (Hoje)</p>
                <h2 style="color: var(--success);">R$ ${totalRevenue.toFixed(2)}</h2>
            </div>
        </div>
    `;

    if (State.appointments.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim);">Nenhum agendamento registrado.</p>';
        return;
    }

    // Sort by time
    const sortedApps = [...State.appointments].sort((a, b) => a.time.localeCompare(b.time));

    list.innerHTML = sortedApps.map(a => `
        <div class="list-item">
            <div class="item-info">
                <h4 style="color: white;">${a.clientName}</h4>
                <p>${a.serviceName} ${a.barberName ? `com <strong>${a.barberName}</strong>` : ''}</p>
                <p style="font-size: 0.8rem; margin-top: 4px;">
                    <i class="fas fa-calendar"></i> ${a.date} • <i class="fas fa-clock"></i> <span style="color: var(--primary);">${a.time}</span>
                </p>
            </div>
            <div class="item-actions">
                <span class="status-badge" style="background: rgba(46, 204, 113, 0.2); color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">Confirmado</span>
                <button class="action-btn delete" onclick="deleteAppointment(${a.id})"><i class="fas fa-times-circle"></i></button>
            </div>
        </div>
    `).join('');
}

window.deleteAppointment = (id) => {
    if (confirm('Cancelar este agendamento?')) {
        State.appointments = State.appointments.filter(a => a.id != id);
        localStorage.setItem('barber_appointments', JSON.stringify(State.appointments));
        renderDashboard();
    }
};

// --- Booking Wizard Logic ---
function initBookingWizard() {
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => btn.addEventListener('click', () => {
        const currentStep = parseInt(document.querySelector('.step-content.active').id.split('-').pop());
        goToStep(currentStep - 1);
    }));

    document.getElementById('confirm-booking-btn').addEventListener('click', finalizeBooking);
}

function startBookingWizard() {
    State.bookingData = { service: null, barber: null, date: null, time: null };
    goToStep(1);
    renderBookingServices();
}

function goToStep(stepNum) {
    // Update steps UI
    document.querySelectorAll('.step').forEach(s => {
        const sNum = parseInt(s.dataset.step);
        s.classList.toggle('active', sNum === stepNum);
        s.classList.toggle('completed', sNum < stepNum);
    });

    // Update content UI
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`booking-step-${stepNum}`).classList.add('active');
}

function renderBookingServices() {
    const container = document.getElementById('booking-services');
    container.innerHTML = State.services.map(s => `
        <div class="booking-service-card" onclick="selectBookingService(${s.id})">
            <i class="fas fa-cut"></i>
            <h4>${s.name}</h4>
            <p>R$ ${s.price} • ${s.duration} min</p>
        </div>
    `).join('');
}

window.selectBookingService = (id) => {
    State.bookingData.service = State.services.find(s => s.id == id);
    renderBookingBarbers();
    goToStep(2);
};

function renderBookingBarbers() {
    const container = document.getElementById('booking-barbers');
    container.innerHTML = State.barbers.map(b => `
        <div class="booking-service-card" onclick="selectBookingBarber(${b.id})">
            <i class="fas fa-user-tie"></i>
            <h4>${b.name}</h4>
            <p>${b.specialty}</p>
        </div>
    `).join('');
}

window.selectBookingBarber = (id) => {
    State.bookingData.barber = State.barbers.find(b => b.id == id);
    renderCalendar();
    goToStep(3);
};

function renderCalendar() {
    const header = document.getElementById('calendar-header');
    const grid = document.getElementById('calendar-grid');
    const now = new Date();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    header.innerHTML = `<span>${monthNames[now.getMonth()]} ${now.getFullYear()}</span>`;
    
    // Simple calendar logic
    let daysHtml = '';
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= lastDayOfMonth; i++) {
        const dateStr = `${i}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const isPast = i < now.getDate();
        const isSelected = State.bookingData.date === dateStr;
        
        daysHtml += `
            <div class="cal-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="selectBookingDate('${dateStr}')">
                ${i}
            </div>
        `;
    }
    grid.innerHTML = daysHtml;
    renderTimeSlots();
}

window.selectBookingDate = (date) => {
    State.bookingData.date = date;
    renderCalendar();
};

function renderTimeSlots() {
    const container = document.getElementById('time-slots');
    if (!State.bookingData.date) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-dim);">Selecione uma data acima</p>';
        return;
    }

    const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];
    
    container.innerHTML = slots.map(time => {
        const isTaken = State.appointments.some(a => a.date === State.bookingData.date && a.time === time && a.barberId === State.bookingData.barber.id);
        const isSelected = State.bookingData.time === time;
        
        return `
            <div class="slot ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="${isTaken ? '' : `selectBookingTime('${time}')`}">
                ${time}
            </div>
        `;
    }).join('');
}

window.selectBookingTime = (time) => {
    State.bookingData.time = time;
    renderTimeSlots();
    renderBookingSummary();
    goToStep(4);
};

function renderBookingSummary() {
    const container = document.getElementById('booking-summary');
    const { service, barber, date, time } = State.bookingData;
    
    container.innerHTML = `
        <div class="summary-item"><span>Serviço:</span> <strong>${service.name}</strong></div>
        <div class="summary-item"><span>Valor:</span> <strong>R$ ${service.price}</strong></div>
        <div class="summary-item"><span>Profissional:</span> <strong>${barber.name}</strong></div>
        <div class="summary-item"><span>Data:</span> <strong>${date}</strong></div>
        <div class="summary-item"><span>Horário:</span> <strong>${time}</strong></div>
    `;
}

function finalizeBooking() {
    console.log('Finalizing booking...');
    const nameInput = document.getElementById('client-name');
    const phoneInput = document.getElementById('client-phone');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        alert('Por favor, preencha seu nome e contato.');
        return;
    }

    try {
        const newApp = {
            id: Date.now(),
            clientName: name,
            clientPhone: phone,
            serviceId: State.bookingData.service.id,
            serviceName: State.bookingData.service.name,
            servicePrice: State.bookingData.service.price,
            barberId: State.bookingData.barber.id,
            barberName: State.bookingData.barber.name,
            date: State.bookingData.date,
            time: State.bookingData.time
        };

        State.appointments.push(newApp);
        localStorage.setItem('barber_appointments', JSON.stringify(State.appointments));
        
        // Reset form
        nameInput.value = '';
        phoneInput.value = '';
        
        alert('Agendamento realizado com sucesso!');
        switchView('dashboard');
    } catch (err) {
        console.error('Error in finalizeBooking:', err);
        alert('Ocorreu um erro ao salvar o agendamento. Tente novamente.');
    }
}
