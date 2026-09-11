// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
    TELEGRAM_USERNAME: 'flflflflffl',
    SHOP_NAME: 'CraftyToys',
    CURRENCY: '₽'
};

// ========== ТОВАРЫ ==========
const PRODUCTS = [
    {
        id: 1,
        name: "Зайчик",
        category: "животные",
        price: 2800,
        description: "Белый пушистый зайка из альпаки. Высота 25 см.",
        image: "images/zayac.jpg"
    },
    {
        id: 2,
        name: "Дракон",
        category: "персонажи",
        price: 3500,
        description: "Добрый дракон с подвижными крыльями.",
        image: "images/dragon.jpg"
    },
    {
        id: 3,
        name: "Мишка",
        category: "животные",
        price: 3200,
        description: "Классический Тедди в рубашке.",
        image: "images/mishka.jpg"
    },
    {
        id: 4,
        name: "Ангел",
        category: "интерьерные",
        price: 1900,
        description: "Нежный ангел для украшения дома.",
        image: "images/angel.jpg"
    },
    {
        id: 5,
        name: "Лисёнок",
        category: "животные",
        price: 2700,
        description: "Хитрый лисёнок с пушистым хвостом.",
        image: "images/lisenok.jpg"
    },
    {
        id: 6,
        name: "Единорог",
        category: "персонажи",
        price: 4200,
        description: "Волшебный единорог с разноцветной гривой.",
        image: "images/unicorn.jpg"
    },
    {
        id: 7,
        name: "Сова",
        category: "персонажи",
        price: 3100,
        description: "Мудрая сова с большими глазами и мягкими крыльями.",
        image: "images/sova.jpg"
    },
    {
        id: 8,
        name: "Снеговик",
        category: "интерьерные",
        price: 2300,
        description: "Маленький вязаный снеговик с шарфиком, идеален для новогоднего декора.",
        image: "images/snegovik.jpg"
    },
    {
        id: 9,
        name: "Сердечко-подушка",
        category: "интерьерные",
        price: 1800,
        description: "Мягкая декоративная подушечка в форме сердца — для дивана или кроватки.",
        image: "images/serdtse.jpg"
    }
];

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let cart = JSON.parse(localStorage.getItem('craftytoys_cart')) || [];
let tg = window.Telegram?.WebApp;

// ========== ЗАГРУЗКА ТОВАРОВ ==========
function loadProducts() {
    console.log('Загружаю товары...');
    const container = document.getElementById('productsContainer');
    if (!container) {
        console.error('Не найден контейнер productsContainer!');
        return;
    }
    
    container.innerHTML = PRODUCTS.map(product => `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="console.error('Не загружена картинка:', this.src); this.src='https://placehold.co/400x300/ffe6ee/ff6b9d?text=${encodeURIComponent(product.name)}'">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Товары загружены:', PRODUCTS.length);
}

// ========== КОРЗИНА ==========
function addToCart(productId) {
    console.log('Добавляю в корзину:', productId);
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        console.error('Товар не найден:', productId);
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showMessage('🎉 Добавлено в корзину!');
}

function updateCart() {
    // Счетчик в шапке
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = totalItems;
    
    // Сохраняем в localStorage
    localStorage.setItem('craftytoys_cart', JSON.stringify(cart));
}

function showMessage(text) {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b9d;
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ========== КОРЗИНА (панель) ==========
function updateCartPanel() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (!container || !totalElement) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>Корзина пока пуста</p>
                <p class="empty-hint">Добавьте первую игрушку!</p>
            </div>
        `;
        totalElement.textContent = '0 ₽';
        return;
    }
    
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                     onerror="this.src='https://placehold.co/100x100/ffe6ee/ff6b9d?text=🎁'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽/шт</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">${itemTotal.toLocaleString()} ₽</div>
                </div>
            </div>
        `;
    }).join('');
    
    totalElement.textContent = `${total.toLocaleString()} ₽`;
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ КНОПОК ==========
window.changeQuantity = function(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity < 1) {
        cart = cart.filter(item => item.id !== productId);
    }
    
    updateCart();
    updateCartPanel();
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    updateCartPanel();
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('CraftyToys загружается...');
    
    // Загружаем товары
    loadProducts();
    
    // Загружаем корзину
    updateCart();
    
    // Настраиваем кнопку корзины
    const cartButton = document.getElementById('cartButton');
    const closeButton = document.getElementById('closeCart');
    const overlay = document.getElementById('cartOverlay');
    const checkoutButton = document.getElementById('checkoutBtn');
    
    if (cartButton && overlay) {
        cartButton.addEventListener('click', function() {
            overlay.style.display = 'flex';
            updateCartPanel();
        });
    }
    
    if (closeButton && overlay) {
        closeButton.addEventListener('click', function() {
            overlay.style.display = 'none';
        });
    }
    
    // Закрытие по клику на оверлей
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
    
    // Кнопка оформления заказа
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (cart.length === 0) {
                showMessage('Корзина пуста!');
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderNumber = 'CT' + Date.now().toString().slice(-6);
            
            const message = `🧸 *ЗАКАЗ из CraftyToys* (#${orderNumber})\n\n` +
                           `*Состав заказа:*\n` +
                           cart.map(item => 
                               `▫️ ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ₽`
                           ).join('\n') +
                           `\n\n*Итого:* ${total.toLocaleString()} ₽\n` +
                           `*Статус:* 🟡 Ожидает подтверждения\n\n` +
                           `_Для подтверждения заказа ответьте на это сообщение._`;
            
            const telegramUrl = `https://t.me/${CONFIG.TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
            
            // Очищаем корзину
            cart = [];
            updateCart();
            if (overlay) overlay.style.display = 'none';
            
            // Открываем Telegram
            if (tg && tg.openTelegramLink) {
                tg.openTelegramLink(telegramUrl);
                showMessage('✅ Заказ отправлен!');
            } else {
                window.open(telegramUrl, '_blank');
                showMessage('✅ Заказ сформирован!');
            }
        });
    }
    
    // Категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Добавляем текущей
            this.classList.add('active');
            
            // Фильтруем товары
            const category = this.getAttribute('data-category');
            if (category === 'all') {
                loadProducts();
            } else {
                const container = document.getElementById('productsContainer');
                const filtered = PRODUCTS.filter(p => p.category === category);
                
                container.innerHTML = filtered.map(product => `
                    <div class="product-card">
                        <div class="product-image-container">
                            <img src="${product.image}" 
                                 alt="${product.name}" 
                                 class="product-image"
                                 onerror="this.src='https://placehold.co/400x300/ffe6ee/ff6b9d?text=${encodeURIComponent(product.name)}'">
                        </div>
                        <div class="product-info">
                            <div class="product-category">${product.category}</div>
                            <h3 class="product-title">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-footer">
                                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                                <button class="add-to-cart" onclick="addToCart(${product.id})">
                                    <i class="fas fa-cart-plus"></i> В корзину
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        });
    });
    
    console.log('CraftyToys готов!');
});

// Стиль для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);