function showColorPalettes() {
    const makeStandardTheme = (a, b, c, d) => [a, b, c, d];
    const palettes1 = {
        // Reds
        cranberry: makeStandardTheme('#5B0F10', '#791A15', '#A32E30', '#F4C7BA'), // Deep maroon with a berry undertone
        red: makeStandardTheme('#660000', '#880000', '#C32222', '#F8CFCF'), // Classic and bold crimson red
        coral: makeStandardTheme('#762F2F', '#AF4A4A', '#D36868', '#FFD6D2'), // Warm reddish-pink inspired by coral
        terracotta: makeStandardTheme('#713F2D', '#9C5F4E', '#C87561', '#FAD4C5'), // Earthy, pottery-inspired orange

        // Oranges and Yellows
        rust: makeStandardTheme('#8B3103', '#B54D18', '#D65C2B', '#F7DAC3'), // Fiery, weathered orange-brown
        orange: makeStandardTheme('#783F04', '#B45F06', '#E6751A', '#FDE0C4'), // Vibrant and warm orange tones
        yellow: makeStandardTheme('#7F6000', '#BF9000', '#E6AC1E', '#FFF0BE'), // Bright, golden yellow

        // Greens
        green: makeStandardTheme('#294E13', '#38761D', '#4B9022', '#DBEBD3'), // Classic forest green
        moss: makeStandardTheme('#1E4D2B', '#3A7A47', '#519563', '#D9E8D6'), // Cool, earthy green
        sage: makeStandardTheme('#38471F', '#596F34', '#6F8440', '#DFEADF'), // Muted, calming green
        teal: makeStandardTheme('#00494D', '#007373', '#009282', '#D6F2EE'), // Vibrant, deep aquatic teal

        // Blues
        slate: makeStandardTheme('#25403F', '#305050', '#4A6767', '#DCE6E6'), // Muted gray-blue
        cyan: makeStandardTheme('#0C343D', '#134F5C', '#1B657A', '#D0E9EA'), // Crisp, fresh cyan
        blue: makeStandardTheme('#073763', '#0B5394', '#1763B8', '#D0E4F2'), // Deep, classic royal blue
        azure: makeStandardTheme('#123A75', '#1E5BAA', '#2D70C8', '#D2E4F6'), // Bright, clean azure blue
        skyblue: makeStandardTheme('#004080', '#0066CC', '#2E8FEA', '#CCE4F6'), // Light, airy sky blue

        // Purples and Magentas
        purple: makeStandardTheme('#20124D', '#351C75', '#483CA4', '#D7D2E5'), // Rich, elegant purple
        lavender: makeStandardTheme('#3F3677', '#5F51B7', '#776CCF', '#DCD7F4'), // Soft, muted lavender
        plum: makeStandardTheme('#4E1A45', '#6C3483', '#84479E', '#E9D2EC'), // Warm, luxurious plum
        magenta: makeStandardTheme('#4C1130', '#65183E', '#88234D', '#F5D6E0'), // Bold, vibrant magenta
        rose: makeStandardTheme('#682F42', '#994D63', '#B65C80', '#F7D6DE'), // Soft, romantic rose pink

        // Neutrals
        sand: makeStandardTheme('#6A5D47', '#8C755D', '#B5937A', '#EFE2D4'), // Warm sandy tones
        bronze: makeStandardTheme('#5D4037', '#895D4D', '#A6705F', '#ECD8C9'), // Soft metallic bronze
        taupe: makeStandardTheme('#483C32', '#6B5D4F', '#857667', '#E7DDD3'), // Warm, understated taupe
        gray: makeStandardTheme('#3B3B3B', '#656565', '#7E7E7E', '#EAEAEA'), // Neutral grays
        charcoal: makeStandardTheme('#2A2A2A', '#4D4D4D', '#676767', '#E4E4E4'), // Deep, bold charcoal
    };

    const palettes = {
        // Reds
        cranberry: makeStandardTheme('#5B0F10', '#791A15', '#A32E30', '#F4C2B5'), // Dark maroon tones
        red: makeStandardTheme('#660000', '#880000', '#C32222', '#F8C5C5'), // Classic red shades
        coral: makeStandardTheme('#762F2F', '#AF4A4A', '#D36868', '#FFE0DC'), // Warm reddish-pink
        terracotta: makeStandardTheme('#713F2D', '#9C5F4E', '#C87561', '#FAD9CE'), // Earthy orange-red

        // Oranges and Yellows
        rust: makeStandardTheme('#8B3103', '#B54D18', '#D65C2B', '#F7D5BC'), // Deep orange-brown
        orange: makeStandardTheme('#783F04', '#B45F06', '#E6751A', '#FDD9BC'), // Bold orange shades
        yellow: makeStandardTheme('#856500', '#BF9000', '#E6AC1E', '#FFF2C4'), // Golden yellow tones
        
        // Greens
        green: makeStandardTheme('#294E13', '#38761D', '#4B9022', '#D6E8CE'), // Deep forest green
        moss: makeStandardTheme('#1E4D2B', '#3A7A47', '#519563', '#D4E8D1'), // Cool earthy green
        sage: makeStandardTheme('#38471F', '#596F34', '#788F4A', '#DCEADF'), // Muted green tones
        
        // Blues
        slate: makeStandardTheme('#2A4545', '#366060', '#507878', '#DEE8E8'), // Muted gray-blue
        teal: makeStandardTheme('#004548', '#006E6E', '#008F8F', '#D1F0EC'), // Deep blue-green
        cyan: makeStandardTheme('#0C343D', '#134F5C', '#1B657A', '#CBE5E8'), // Fresh blue-green
        blue: makeStandardTheme('#073763', '#0B5394', '#1763B8', '#CEE2F0'), // Classic blue shades
        azure: makeStandardTheme('#123A75', '#1E5BAA', '#2D70C8', '#D0E2F4'), // Bright sky blue
        skyblue: makeStandardTheme('#004080', '#0066CC', '#2E8FEA', '#D0E6F8'), // Light sky blue
        
        // Purples and Magentas
        purple: makeStandardTheme('#20124D', '#351C75', '#483CA4', '#D5D0E3'), // Deep purple shades
        lavender: makeStandardTheme('#3F3677', '#5F51B7', '#776CCF', '#DAD5F2'), // Soft lavender tones
        plum: makeStandardTheme('#4E1A45', '#6C3483', '#8E4FA8', '#E7D0EA'), // Warm purple-pink
        magenta: makeStandardTheme('#541436', '#6D1C44', '#912651', '#F3D4DE'), // Bold pink-purple
        rose: makeStandardTheme('#682F42', '#8D4659', '#A85475', '#F5D4DC'), // Soft pink-red
        
        // Neutrals
        sand: makeStandardTheme('#6A5D47', '#8C755D', '#B5937A', '#EDE0D2'), // Warm beige tones
        bronze: makeStandardTheme('#5D4037', '#895D4D', '#A6705F', '#EAD6C7'), // Metallic brown
        taupe: makeStandardTheme('#483C32', '#6B5D4F', '#857667', '#E5DBD1'), // Neutral brown-gray
        gray: makeStandardTheme('#3B3B3B', '#656565', '#7E7E7E', '#E8E8E8'), // Neutral gray shades
        charcoal: makeStandardTheme('#2A2A2A', '#4D4D4D', '#676767', '#E2E2E2'), // Deep gray tones
    };
    
    
    
    // Clear the current page
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f0f0f0;';
    
    // Create table
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse: collapse; border-spacing: 0; width: 100%;';

    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Palette', 'Darkest', 'Dark', 'Normal', 'Lightest'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cssText = `padding: 10px; text-align: ${header === 'Palette' ? 'right' : 'center'}; background: #fff; color: #000; font-weight: bold;`;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create color rows
    const tbody = document.createElement('tbody');
    Object.entries(palettes).forEach(([name, colors]) => {
        const row = document.createElement('tr');

        // Add palette name
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        nameCell.style.cssText = `padding: 10px; text-align: right; font-weight: bold; background: #fff; color: ${colors[1]};`;
        row.appendChild(nameCell);

        // Add color cells
        colors.forEach((color, index) => {
            const cell = document.createElement('td');
            cell.style.cssText = `
                height: 60px;
                background: ${color};
                text-align: center;
                font-size: 12px;
                font-weight: ${index > 1 ? 'normal' : 'normal'};
                color: ${index > 1 //isLightColor(color)
                    ? '#000' : '#fff'};
                
            `;
            cell.textContent = color.toUpperCase();
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    document.body.appendChild(table);
}

// Helper function to determine if text should be black or white
function isLightColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

// Run the function
showColorPalettes();
