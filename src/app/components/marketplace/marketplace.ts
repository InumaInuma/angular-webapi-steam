import { Component, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 👈 Import Router
import { FormsModule } from '@angular/forms'; // 👈 Import FormsModule
import { Observable } from 'rxjs';
import { Dota, MarketplaceItem } from '../../service/dota';
import { Auth } from '../../service/auth';
import { Walletservice } from '../../service/walletservice';

@Component({
    selector: 'app-marketplace',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './marketplace.html',
    styleUrls: ['./marketplace.scss']
})
export class MarketplaceComponent implements OnInit {
    items: MarketplaceItem[] = [];
    filteredItems: MarketplaceItem[] = [];
    isLoggedIn$: Observable<boolean>;

    filters = ['Todos', 'Arcana', 'Immortal', 'Legendary', 'Mythical', 'Rare'];
    activeFilter = 'Todos';

    // Hero filter
    heroes: string[] = [];
    activeHeroFilter = 'Todos';

    // Name & Price filters
    searchName = '';
    minPrice: number | null = null;
    maxPrice: number | null = null;

    // Specialty filter
    specialties = [
        { id: 'Fuerza', name: 'Fuerza', icon: '/fuerza.png', color: '#ff4d4d' },
        { id: 'Agilidad', name: 'Agilidad', icon: '/agilidad.png', color: '#2ecc71' },
        { id: 'Inteligencia', name: 'Inteligencia', icon: '/inteligencia.png', color: '#3498db' },
        { id: 'Universal', name: 'Universal', icon: '/universal.png', color: '#f1c40f' }
    ];
    activeSpecialty: string | null = null;

    // Comprehensive hero categories (Dota 2)
    heroCategories: { [key: string]: string[] } = {
        'Fuerza': [
            'Alchemist', 'Axe', 'Bristleback', 'Centaur Warrunner', 'Chaos Knight', 'Clockwerk',
            'Dawnbreaker', 'Doom', 'Dragon Knight', 'Earth Spirit', 'Earthshaker', 'Elder Titan',
            'Huskar', 'Kunkka', 'Legion Commander', 'Lifestealer', 'Lycan', 'Mars',
            'Night Stalker', 'Ogre Magi', 'Omniknight', 'Phoenix', 'Primal Beast', 'Pudge',
            'Slardar', 'Spirit Breaker', 'Sven', 'Tidehunter', 'Timbersaw', 'Tiny',
            'Treant Protector', 'Tusk', 'Underlord', 'Undying', 'Wraith King'
        ],
        'Agilidad': [
            'Anti-Mage', 'Arc Warden', 'Bloodseeker', 'Bounty Hunter', 'Clinkz', 'Drow Ranger',
            'Ember Spirit', 'Faceless Void', 'Gyrocopter', 'Hoodwink', 'Juggernaut', 'Luna',
            'Medusa', 'Meepo', 'Monkey King', 'Morphling', 'Naga Siren', 'Phantom Assassin',
            'Phantom Lancer', 'Razor', 'Riki', 'Shadow Fiend', 'Slark', 'Sniper', 'Spectre',
            'Templar Assassin', 'Terrorblade', 'Troll Warlord', 'Ursa', 'Viper', 'Weaver'
        ],
        'Inteligencia': [
            'Ancient Apparition', 'Crystal Maiden', 'Dark Seer', 'Dazzle', 'Death Prophet',
            'Disruptor', 'Enchantress', 'Grimstroke', 'Jakiro', 'Keeper of the Light', 'Leshrac',
            'Lich', 'Lina', 'Lion', 'Muerta', 'Nature\'s Prophet', 'Necrophos', 'Oracle',
            'Outworld Destroyer', 'Puck', 'Pugna', 'Queen of Pain', 'Rubick', 'Shadow Demon',
            'Shadow Shaman', 'Silencer', 'Skywrath Mage', 'Storm Spirit', 'Tinker', 'Warlock',
            'Witch Doctor', 'Zeus'
        ],
        'Universal': [
            'Abaddon', 'Bane', 'Batrider', 'Beastmaster', 'Brewmaster', 'Broodmother', 'Chen',
            'Dark Willow', 'Enigma', 'Invoker', 'Io', 'Lone Druid',
            'Magnus', 'Marci', 'Mirana', 'Nyx Assassin', 'Pangolier', 'Sand King',
            'Snapfire', 'Techies', 'Vengeful Spirit', 'Venomancer', 'Visage',
            'Void Spirit', 'Windranger', 'Winter Wyvern'
        ]
    };

    // Mapping icons for specific heroes that already exist in public folder
    existingHeroImages: { [key: string]: string } = {
        'Alchemist': '/fuerza/alchimis.png',
        'Axe': '/fuerza/axe.png',
        'Bristleback': '/fuerza/Bristleback.png',
        'Centaur Warrunner': '/fuerza/centaur.png',
        'Chaos Knight': '/fuerza/chaos.png',
        'Clockwerk': '/fuerza/Clockwerk.png',
        'Dawnbreaker': '/fuerza/Dawnbreaker.png',
        'Doom': '/fuerza/Doom.png',
        'Dragon Knight': '/fuerza/Dragon-Knight.png',
        'Earth Spirit': '/fuerza/Earth-Spirit.png',
        'Earthshaker': '/fuerza/Earthshaker.png',
        'Elder Titan': '/fuerza/Elder-Titan.png',
        'Huskar': '/fuerza/Huskar.png',
        'Kunkka': '/fuerza/Kunkka.png',
        'Legion Commander': '/fuerza/Legion-Commander.png',
        'Lifestealer': '/fuerza/Lifestealer.png',
        'Lycan': '/fuerza/Lycan.png',
        'Mars': '/fuerza/Mars.png',
        'Night Stalker': '/fuerza/Night-Stalker.png',
        'Ogre Magi': '/fuerza/Ogre-Magi.png',
        'Omniknight': '/fuerza/Omniknight.png',
        'Phoenix': '/fuerza/Phoenix.png',
        'Primal Beast': '/fuerza/Primal-Beast.png',
        'Pudge': '/fuerza/Pudge.png',
        'Slardar': '/fuerza/Slardar.png',
        'Spirit Breaker': '/fuerza/Spirit-Breaker.png',
        'Sven': '/fuerza/Sven.png',
        'Tidehunter': '/fuerza/Tidehunter.png',
        'Timbersaw': '/fuerza/Timbersaw.png',
        'Tiny': '/fuerza/Tiny.png',
        'Treant Protector': '/fuerza/Treant-Protector.png',
        'Tusk': '/fuerza/Tusk.png',
        'Underlord': '/fuerza/Underlord.png',
        'Undying': '/fuerza/Undying.png',
        'Wraith King': '/fuerza/Wraith-King.png',
        'Anti-Mage': '/agilidad/antimage.png',
        'Faceless Void': '/agilidad/void.png',
        'Lion': '/inteligencia/lion.png',
        'Zeus': '/inteligencia/zeus.png',
        'Techies': '/universal/techis.png'
    };

    // State for hover
    hoveredSpec: string | null = null;

    constructor(
        private dotaService: Dota,
        private cdr: ChangeDetectorRef,
        private authService: Auth,
        private router: Router, // 👈 Inject Router
        private walletService: Walletservice
    ) {
        this.isLoggedIn$ = this.authService.isLoggedIn$;
    }

    ngOnInit() {
        this.dotaService.getMarketplaceItems().subscribe((res) => {
            this.items = (res ?? []).map(item => {
                // Parse gems if string (force cast to handle raw data)
                const rawGems = item.gems as any;
                if (typeof rawGems === 'string') {
                    try {
                        item.gems = JSON.parse(rawGems);
                    } catch (e) {
                        item.gems = [];
                    }
                }
                return item;
            });
            this.extractHeroes();
            this.applyFilter();
            this.cdr.detectChanges();
        });
    }

    // Extraer héroes únicos de los ítems y ordenarlos
    // Extraer héroes únicos de los ítems y ordenarlos
    extractHeroes() {
        const heroes = this.items
            .map(i => i.hero)
            .filter((h): h is string => !!h); // 👈 Type predicate para asegurar que es string

        const uniqueHeroes = new Set(heroes);
        this.heroes = ['Todos', ...Array.from(uniqueHeroes).sort()];
    }

    setFilter(filter: string) {
        this.activeFilter = filter;
        this.applyFilter();
    }

    setHeroFilter(hero: string) {
        if (this.activeHeroFilter === hero) {
            this.activeHeroFilter = 'Todos';
        } else {
            this.activeHeroFilter = hero;
        }
        this.applyFilter();
    }

    setSpecialtyFilter(specialty: string) {
        if (this.activeSpecialty === specialty) {
            this.activeSpecialty = null;
        } else {
            this.activeSpecialty = specialty;
        }
        this.applyFilter();
    }

    applyFilter() {
        this.filteredItems = this.items.filter(item => {
            // 1. Filtro de Rareza
            const matchesRarity = this.activeFilter === 'Todos' ||
                item.rarity === this.activeFilter ||
                item.type === this.activeFilter;

            // 2. Filtro de Héroe
            const matchesHero = this.activeHeroFilter === 'Todos' ||
                item.hero === this.activeHeroFilter;

            // 3. Filtro por Nombre (búsqueda parcial, case-insensitive)
            const matchesName = this.searchName.trim() === '' ||
                item.itemName.toLowerCase().includes(this.searchName.toLowerCase());

            // 4. Filtro por Precio
            const matchesMinPrice = this.minPrice === null || item.price >= this.minPrice;
            const matchesMaxPrice = this.maxPrice === null || item.price <= this.maxPrice;

            // 5. Filtro por Especialidad
            let matchesSpecialty = true;
            if (this.activeSpecialty) {
                const heroesInSpec = this.heroCategories[this.activeSpecialty] || [];
                matchesSpecialty = !!item.hero && heroesInSpec.includes(item.hero);
            }

            return matchesRarity && matchesHero && matchesName && matchesMinPrice && matchesMaxPrice && matchesSpecialty;
        });
    }

    buy(item: MarketplaceItem) {
        // 1. Validar Login
        if (!this.authService.isLoggedInValue()) {
            if (confirm('Necesitas iniciar sesión para comprar. ¿Ir al login?')) {
                this.router.navigate(['/login']);
            }
            return;
        }

        // 2. Validar que no sea su propio item
        const currentUserId = Number(localStorage.getItem('userId'));
        if (item.sellerUserId === currentUserId) {
            alert('❌ No puedes comprar un artículo que tú mismo has puesto en venta.');
            return;
        }

        if (!confirm(`¿Estás seguro de comprar ${item.itemName} por ${item.currencyCode} ${item.price}?`)) {
            return;
        }

        this.dotaService.buyItem(item.listingId).subscribe({
            next: (res: any) => {
                alert('✅ ¡Compra exitosa! Revisa tus pedidos pendientes.');
                this.ngOnInit(); // Recargar la lista
                // Actualizar balance global
                this.walletService.getBalance().subscribe({
                    next: (res: any) => {
                        if (res && res.balance !== undefined) {
                            this.authService.setBalance(res.balance);
                        }
                    },
                    error: (err) => console.error('Error fetching balance:', err)
                });
            },
            error: (err: any) => {
                console.error(err);
                alert('❌ Error al comprar: ' + (err.error?.message || err.message));
            }
        });
    }

    getHeroImageUrl(hero: string, spec: string): string {
        if (this.existingHeroImages[hero]) {
            return this.existingHeroImages[hero];
        }
        return '/dota.jpg';
    }

    onHeroImageError(event: any) {
        event.target.src = '/dota.jpg';
        event.target.classList.add('image-not-found');
    }
}
