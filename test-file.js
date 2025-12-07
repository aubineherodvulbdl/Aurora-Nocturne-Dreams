/**
 * Aurora Nocturne Theme - Test File
 * This file demonstrates how the theme looks with various code elements
 * ❄️ Experience the beauty of polar night coding ❄️
 */

// Import statements - should appear in aurora green
import { createAurora, PolarNight } from './aurora-effects';
import * as winterMagic from 'northern-lights';

// Constants - should appear in starlight white
const AURORA_COLORS = {
    green: '#00f5d4',    // Aurora green - bирюзово-неоновый
    violet: '#8a2be2',   // Polar violet - фиолетовый всполох
    pink: '#d16ba5',     // Midnight pink - розовый оттенок
    blue: '#5dade2',     // Icicle blue - голубой лёд
    white: '#f0f8ff'     // Starlight - холодный белый
};

// Numbers should appear in midnight pink
const POLAR_COORDINATES = {
    latitude: 69.6492,
    longitude: 18.9553,
    altitude: 350,
    temperature: -25.7
};

/**
 * Class definition - should appear in starlight
 * JSDoc comments should be in muted arctic grey
 */
class AuroraNocturne {
    // Constructor with parameters in italic
    constructor(intensity = 'full', variant = 'standard') {
        this.intensity = intensity;      // Variables in icy white
        this.variant = variant;
        this.isActive = true;           // Boolean constants
        this.colors = AURORA_COLORS;    // Reference to constants
        this._privateProperty = null;   // Private properties
    }

    // Method definitions - functions in icicle blue
    async displayAurora(duration = 3600) {
        try {
            // String literals in aurora green
            const message = `Displaying aurora for ${duration} seconds`;
            console.log(message);
            
            // Template literals with expressions
            const status = `Aurora ${this.variant} is ${this.isActive ? 'active' : 'inactive'}`;
            
            // Array operations
            const lightPatterns = [
                'dancing waves',
                'spiral formations', 
                'curtain effects',
                'corona displays'
            ];
            
            // Object destructuring
            const { green, violet, pink } = this.colors;
            
            // Arrow functions
            const createPattern = (color, intensity) => ({
                color: color,
                brightness: intensity * 0.8,
                duration: Math.random() * 1000
            });
            
            // Map operations
            const patterns = lightPatterns.map(pattern => 
                createPattern(green, this.intensity === 'soft' ? 0.6 : 1.0)
            );
            
            // Async/await operations
            const result = await this.animateAurora(patterns);
            return result;
            
        } catch (error) {
            // Error handling - errors in midnight pink
            console.error('Aurora display failed:', error.message);
            throw new Error(`Failed to display aurora: ${error}`);
        }
    }

    // Static method
    static calculateVisibility(weather, moonPhase) {
        // Conditional logic
        if (weather.cloudCover > 0.3) {
            return 'poor';
        } else if (moonPhase === 'new') {
            return 'excellent';
        } else {
            return 'good';
        }
    }

    // Getter/setter methods
    get currentIntensity() {
        return this._intensity;
    }

    set currentIntensity(value) {
        if (value < 0 || value > 1) {
            throw new RangeError('Intensity must be between 0 and 1');
        }
        this._intensity = value;
    }
}

// Function declarations
function createPolarNight(config) {
    // Destructuring parameters
    const { 
        backgroundColor = AURORA_COLORS.violet,
        textColor = AURORA_COLORS.white,
        accentColor = AURORA_COLORS.green 
    } = config;
    
    // Regular expressions - should be in starlight
    const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    // Validation
    if (!colorPattern.test(backgroundColor)) {
        console.warn('Invalid background color format');
    }
    
    return {
        theme: 'Aurora Nocturne',
        colors: { backgroundColor, textColor, accentColor },
        timestamp: new Date().toISOString(),
        // Computed properties
        isValid: colorPattern.test(backgroundColor) && 
                colorPattern.test(textColor) && 
                colorPattern.test(accentColor)
    };
}

// Async function with generators
async function* generateAuroraFrames(duration) {
    let frame = 0;
    const startTime = Date.now();
    
    while (Date.now() - startTime < duration) {
        // Yield with complex expressions
        yield {
            frame: frame++,
            timestamp: Date.now(),
            colors: Object.values(AURORA_COLORS),
            // Mathematical operations
            intensity: Math.sin(frame * 0.1) * 0.5 + 0.5,
            position: {
                x: Math.cos(frame * 0.05) * 100,
                y: Math.sin(frame * 0.03) * 50
            }
        };
        
        // Await with timeout
        await new Promise(resolve => setTimeout(resolve, 16));
    }
}

// Export statements
export { AuroraNocturne, createPolarNight, generateAuroraFrames };
export default AuroraNocturne;

// Module-level code
const aurora = new AuroraNocturne('soft', 'winter');

// Event listeners and callbacks
aurora.on('display-start', (event) => {
    console.log(`Aurora display started at ${event.timestamp}`);
});

// Promise chains
aurora.displayAurora(1800)
    .then(result => console.log('Aurora completed:', result))
    .catch(error => console.error('Aurora failed:', error))
    .finally(() => console.log('Aurora sequence finished'));

// Modern JavaScript features
const polarNightConfig = {
    ...AURORA_COLORS,
    // Spread operator
    theme: 'Aurora Nocturne',
    // Optional chaining
    visibility: aurora?.currentIntensity ?? 0.8,
    // Nullish coalescing
    duration: aurora.duration || 3600
};

// Tagged template literals
function auroraTemplate(strings, ...values) {
    return `Aurora effect: ${values[0]} with intensity ${values[1]}`;
}

// Usage example
const templateResult = auroraTemplate`Creating ${'northern lights'} with intensity ${0.8}`;

// Symbol usage
const AURORA_SYMBOL = Symbol('aurora-nocturne');
polarNightConfig[AURORA_SYMBOL] = 'magical';

/* 
 * Multi-line comments should appear in muted grey
 * This demonstrates the beautiful Aurora Nocturne theme
 * with its polar night colors and aurora accents
 */

// TODO: Add more aurora effects
// FIXME: Optimize performance for large displays
// NOTE: This theme is inspired by the northern lights

console.log('❄️ Aurora Nocturne theme demonstration complete! ❄️');
