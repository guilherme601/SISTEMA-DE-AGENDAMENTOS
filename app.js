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
    appointments: JSON.parse(localStorage.getItem('barber_appointments')) || []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initShopProfile();
    initServices();
    renderDashboard();
    renderBooking();
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
    if (viewId === 'booking') renderBooking();
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

// --- Dashboard Logic ---
function renderDashboard() {
    const list = document.getElementById('appointments-list');
    if (State.appointments.length === 0) {
        list.innerHTML = '<p style="color: var(--text-dim);">Nenhum agendamento para hoje.</p>';
        return;
    }

    list.innerHTML = State.appointments.map(a => `
        <div class="list-item">
            <div class="item-info">
                <h4 style="color: white;">${a.clientName}</h4>
                <p>${a.serviceName} • <span style="color: var(--primary);">${a.time}</span></p>
            </div>
            <div class="item-actions">
                <span class="status-badge" style="background: rgba(46, 204, 113, 0.2); color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">Confirmado</span>
            </div>
        </div>
    `).join('');
}

// --- Booking Simulation Logic ---
function renderBooking() {
    const container = document.getElementById('booking-services');
    container.innerHTML = State.services.map(s => `
        <div class="booking-service-card" onclick="simulateBooking('${s.name}')">
            <i class="fas fa-cut"></i>
            <h4>${s.name}</h4>
            <p>R$ ${s.price}</p>
        </div>
    `).join('');
}

window.simulateBooking = (serviceName) => {
    const clientName = prompt('Nome do Cliente:');
    if (!clientName) return;
    
    const time = prompt('Horário (ex: 14:30):');
    if (!time) return;

    const newAppointment = {
        id: Date.now(),
        clientName,
        serviceName,
        time,
        date: new Date().toLocaleDateString()
    };

    State.appointments.push(newAppointment);
    localStorage.setItem('barber_appointments', JSON.stringify(State.appointments));
    alert('Agendamento realizado com sucesso!');
    switchView('dashboard');
};
