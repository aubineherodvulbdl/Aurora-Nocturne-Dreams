/**
 * Aurora Nocturne Theme - VS Code Extension Entry Point
 * Greets users when activating the theme extension
 */

const vscode = require('vscode');

/**
 * Called when the extension is activated
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('❄️ Aurora Nocturne Theme extension is now active!');
    
    // Register command to show welcome message manually
    const welcomeCommand = vscode.commands.registerCommand('aurora-nocturne.showWelcome', () => {
        showWelcomeMessage();
    });
    
    context.subscriptions.push(welcomeCommand);
    
    // Check if this is the first time the extension is activated (installation)
    const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
    
    if (!hasShownWelcome) {
        // Mark that we've shown the welcome message
        await context.globalState.update('hasShownWelcome', true);
        
        // Automatically show welcome message on first installation
        showWelcomeMessage();
    }
}

/**
 * Shows the welcome message in a webview panel
 */
function showWelcomeMessage() {
    const panel = vscode.window.createWebviewPanel(
        'auroraNocturneWelcome',
        '❄️ Aurora Nocturne Theme',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );
    
    panel.webview.html = getWelcomeHtml();
    
    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'activateTheme':
                    vscode.commands.executeCommand('workbench.action.selectTheme');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'workbench.colorTheme');
                    break;
            }
        }
    );
}

/**
 * Generates the HTML content for the welcome webview
 */
function getWelcomeHtml() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aurora Nocturne Theme</title>
        <style>
            body {
                background: linear-gradient(135deg, #0b0f1c 0%, #0e1224 50%, #070a14 100%);
                color: #e8f4ff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                overflow-x: hidden;
                position: relative;
            }
            
            /* Animated aurora background */
            .aurora {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                opacity: 0.3;
            }
            
            .aurora-wave {
                position: absolute;
                width: 200%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #00f5d4 25%, 
                    #8a2be2 50%, 
                    #d16ba5 75%, 
                    transparent 100%);
                animation: aurora-flow 15s infinite linear;
                transform: skewY(-5deg);
            }
            
            .aurora-wave:nth-child(2) {
                animation-delay: -5s;
                opacity: 0.5;
                transform: skewY(3deg);
            }
            
            .aurora-wave:nth-child(3) {
                animation-delay: -10s;
                opacity: 0.3;
                transform: skewY(-2deg);
            }
            
            @keyframes aurora-flow {
                0% { transform: translateX(-100%) skewY(-5deg); }
                100% { transform: translateX(100%) skewY(-5deg); }
            }
            
            /* Animated snowflakes */
            .snowflakes {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
            }
            
            .snowflake {
                position: absolute;
                color: #f0f8ff;
                font-size: 1em;
                animation: snowfall 10s infinite linear;
                opacity: 0.8;
            }
            
            @keyframes snowfall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            .container {
                max-width: 900px;
                margin: 0 auto;
                text-align: center;
                position: relative;
                z-index: 1;
            }
            
            .aurora-title {
                font-size: 3.5em;
                font-weight: bold;
                background: linear-gradient(45deg, #00f5d4, #8a2be2, #d16ba5, #5dade2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 20px;
                animation: aurora-glow 3s ease-in-out infinite alternate;
                text-shadow: 0 0 30px rgba(0, 245, 212, 0.5);
                letter-spacing: 3px;
            }
            
            @keyframes aurora-glow {
                from { 
                    filter: drop-shadow(0 0 10px #00f5d4) drop-shadow(0 0 20px #8a2be2);
                    transform: scale(1);
                }
                to { 
                    filter: drop-shadow(0 0 20px #8a2be2) drop-shadow(0 0 30px #d16ba5);
                    transform: scale(1.02);
                }
            }
            
            .subtitle {
                font-size: 1.3em;
                color: #b8c8e0;
                margin-bottom: 30px;
                font-style: italic;
            }
            
            .welcome-box {
                background: rgba(14, 18, 36, 0.9);
                border: 2px solid #00f5d4;
                border-radius: 20px;
                padding: 40px;
                margin: 30px 0;
                box-shadow: 
                    0 0 40px rgba(0, 245, 212, 0.3),
                    inset 0 0 30px rgba(138, 43, 226, 0.1);
                backdrop-filter: blur(15px);
                position: relative;
                overflow: hidden;
            }
            
            .welcome-box::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, #00f5d4 0%, transparent 70%);
                opacity: 0.05;
                animation: pulse 4s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.05; }
                50% { transform: scale(1.1); opacity: 0.1; }
            }
            
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .feature-card {
                background: rgba(7, 10, 20, 0.8);
                border: 1px solid #8a2be2;
                border-radius: 15px;
                padding: 25px;
                transition: all 0.4s ease;
                position: relative;
                overflow: hidden;
            }
            
            .feature-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.1), transparent);
                transition: left 0.6s;
            }
            
            .feature-card:hover::before {
                left: 100%;
            }
            
            .feature-card:hover {
                transform: translateY(-8px);
                border-color: #00f5d4;
                box-shadow: 0 20px 40px rgba(0, 245, 212, 0.2);
            }
            
            .feature-icon {
                font-size: 2.5em;
                margin-bottom: 15px;
                display: block;
            }
            
            .feature-title {
                color: #00f5d4;
                font-size: 1.3em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .feature-description {
                color: #b8c8e0;
                line-height: 1.6;
            }
            
            .button {
                background: linear-gradient(45deg, #00f5d4, #8a2be2);
                border: none;
                color: #0b0f1c;
                padding: 18px 35px;
                margin: 15px;
                border-radius: 30px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.4s ease;
                text-transform: uppercase;
                letter-spacing: 2px;
                position: relative;
                overflow: hidden;
                font-size: 1.1em;
            }
            
            .button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: left 0.6s;
            }
            
            .button:hover::before {
                left: 100%;
            }
            
            .button:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 30px rgba(0, 245, 212, 0.4);
            }
            
            .button-secondary {
                background: linear-gradient(45deg, #5dade2, #d16ba5);
            }
            
            .theme-preview {
                display: flex;
                justify-content: space-around;
                margin: 40px 0;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .theme-variant {
                background: rgba(7, 10, 20, 0.9);
                border: 2px solid #8a2be2;
                border-radius: 20px;
                padding: 30px;
                flex: 1;
                min-width: 280px;
                max-width: 400px;
                transition: all 0.4s ease;
                position: relative;
            }
            
            .theme-variant:hover {
                transform: translateY(-10px);
                border-color: #00f5d4;
                box-shadow: 0 25px 50px rgba(138, 43, 226, 0.3);
            }
            
            .variant-name {
                color: #00f5d4;
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 15px;
            }
            
            .variant-description {
                color: #b8c8e0;
                line-height: 1.6;
            }
            
            .ascii-art {
                font-family: 'Courier New', monospace;
                font-size: 0.6em;
                color: #00f5d4;
                white-space: pre;
                margin: 30px 0;
                text-shadow: 0 0 15px #00f5d4;
                line-height: 1.1;
                animation: ascii-glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes ascii-glow {
                from { text-shadow: 0 0 10px #00f5d4; }
                to { text-shadow: 0 0 25px #00f5d4, 0 0 35px #8a2be2; }
            }
            
            .instructions {
                background: rgba(93, 173, 226, 0.1);
                border: 1px solid #5dade2;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                text-align: left;
            }
            
            .step {
                margin: 12px 0;
                padding: 8px 0;
                display: flex;
                align-items: center;
            }
            
            .step-number {
                color: #d16ba5;
                font-weight: bold;
                font-size: 1.2em;
                margin-right: 15px;
                min-width: 30px;
            }
            
            .emoji {
                font-size: 1.8em;
                margin: 0 8px;
            }
            
            .footer-message {
                margin-top: 50px;
                font-size: 1.2em;
                color: #00f5d4;
                animation: gentle-pulse 3s ease-in-out infinite;
            }
            
            @keyframes gentle-pulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
        </style>
    </head>
    <body>
        <!-- Animated aurora background -->
        <div class="aurora">
            <div class="aurora-wave"></div>
            <div class="aurora-wave"></div>
            <div class="aurora-wave"></div>
        </div>
        
        <!-- Animated snowflakes -->
        <div class="snowflakes" id="snowflakes"></div>
        
        <div class="container">
            <div class="aurora-title">AURORA NOCTURNE</div>
            <div class="subtitle">✨ Where polar night meets ethereal light ✨</div>
            
            <div class="ascii-art">
    ░█████╗░██╗░░░██╗██████╗░░█████╗░██████╗░░█████╗░
    ██╔══██╗██║░░░██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗
    ███████║██║░░░██║██████╔╝██║░░██║██████╔╝███████║
    ██╔══██║██║░░░██║██╔══██╗██║░░██║██╔══██╗██╔══██║
    ██║░░██║╚██████╔╝██║░░██║╚█████╔╝██║░░██║██║░░██║
    ╚═╝░░╚═╝░╚═════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝
    
    ███╗░░██╗░█████╗░░█████╗░████████╗██╗░░░██╗██████╗░███╗░░██╗███████╗
    ████╗░██║██╔══██╗██╔══██╗╚══██╔══╝██║░░░██║██╔══██╗████╗░██║██╔════╝
    ██╔██╗██║██║░░██║██║░░╚═╝░░░██║░░░██║░░░██║██████╔╝██╔██╗██║█████╗░░
    ██║╚████║██║░░██║██║░░██╗░░░██║░░░██║░░░██║██╔══██╗██║╚████║██╔══╝░░
    ██║░╚███║╚█████╔╝╚█████╔╝░░░██║░░░╚██████╔╝██║░░██║██║░╚███║███████╗
    ╚═╝░░╚══╝░╚════╝░░╚════╝░░░░╚═╝░░░░╚═════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚══════╝
            </div>
            
            <div class="welcome-box">
                <h2><span class="emoji">❄️</span>WELCOME TO THE POLAR NIGHT<span class="emoji">❄️</span></h2>
                <p class="subtitle">Thank you for installing the <strong>Aurora Nocturne Theme</strong>!</p>
                <p><span class="emoji">🌌</span>Experience the mystical beauty of northern lights dancing across the arctic sky while you code.</p>
            </div>
            
            <div class="theme-preview">
                <div class="theme-variant">
                    <div class="variant-name">❄️ Aurora Nocturne</div>
                    <div class="variant-description">Full intensity polar night experience with deep arctic blues and brilliant aurora greens that dance across your code like the northern lights.</div>
                </div>
                <div class="theme-variant">
                    <div class="variant-name">✨ Aurora Nocturne Soft</div>
                    <div class="variant-description">Gentle winter variant perfect for extended coding sessions with softer aurora colors and muted polar tones.</div>
                </div>
            </div>
            
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">🌌</div>
                    <div class="feature-title">Polar Night Depths</div>
                    <div class="feature-description">Deep arctic blue backgrounds that create the perfect atmosphere for focused coding sessions.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💎</div>
                    <div class="feature-title">Aurora Accents</div>
                    <div class="feature-description">Ethereal aurora greens and polar violets that highlight your code like dancing northern lights.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-title">Starlight Clarity</div>
                    <div class="feature-description">Crystal-clear text rendering with icicle blues and starlight whites for perfect readability.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">❄️</div>
                    <div class="feature-title">Winter Comfort</div>
                    <div class="feature-description">Eye-friendly design optimized for long winter coding nights with reduced strain.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-title">Dual Variants</div>
                    <div class="feature-description">Choose between full intensity or soft variant to match your coding mood and environment.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔧</div>
                    <div class="feature-title">Full Support</div>
                    <div class="feature-description">Complete semantic highlighting and bracket colorization for all major programming languages.</div>
                </div>
            </div>
            
            <div class="instructions">
                <h3>🎯 How to activate your aurora theme:</h3>
                <div class="step">
                    <span class="step-number">1.</span>
                    <span>Open VS Code Command Palette (Ctrl+Shift+P / Cmd+Shift+P)</span>
                </div>
                <div class="step">
                    <span class="step-number">2.</span>
                    <span>Type "Preferences: Color Theme"</span>
                </div>
                <div class="step">
                    <span class="step-number">3.</span>
                    <span>Select "Aurora Nocturne" or "Aurora Nocturne Soft"</span>
                </div>
                <div class="step">
                    <span class="step-number">4.</span>
                    <span>Enjoy coding under the northern lights! ✨</span>
                </div>
            </div>
            
            <div style="margin: 40px 0;">
                <button class="button" onclick="activateTheme()">🎨 Choose Theme</button>
                <button class="button button-secondary" onclick="openSettings()">⚙️ Open Settings</button>
            </div>
            
            <div class="footer-message">
                <span class="emoji">🌟</span>May your code shine as bright as the aurora borealis!<span class="emoji">🌟</span>
            </div>
        </div>
        
        <script>
            const vscode = acquireVsCodeApi();
            
            // Generate animated snowflakes
            function createSnowflakes() {
                const snowflakesContainer = document.getElementById('snowflakes');
                const numberOfSnowflakes = 50;
                const snowflakeSymbols = ['❄', '❅', '❆', '✦', '✧', '✩'];
                
                for (let i = 0; i < numberOfSnowflakes; i++) {
                    const snowflake = document.createElement('div');
                    snowflake.className = 'snowflake';
                    snowflake.innerHTML = snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];
                    snowflake.style.left = Math.random() * 100 + '%';
                    snowflake.style.animationDelay = Math.random() * 10 + 's';
                    snowflake.style.animationDuration = (Math.random() * 8 + 5) + 's';
                    snowflake.style.fontSize = (Math.random() * 0.8 + 0.5) + 'em';
                    snowflakesContainer.appendChild(snowflake);
                }
            }
            
            function activateTheme() {
                vscode.postMessage({
                    command: 'activateTheme'
                });
            }
            
            function openSettings() {
                vscode.postMessage({
                    command: 'openSettings'
                });
            }
            
            // Initialize snowflakes when page loads
            createSnowflakes();
        </script>
    </body>
    </html>
    `;
}

/**
 * Called when the extension is deactivated
 */
function deactivate() {
    console.log('❄️ Aurora Nocturne Theme extension deactivated');
}

module.exports = {
    activate,
    deactivate
};
