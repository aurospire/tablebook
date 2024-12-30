function showColorPalettes() {
    const makeStandardTheme = (darkest, dark, normal, lightest) => [darkest, dark, normal, lightest];

    const palettes = {

        // Pinks
        pink: makeStandardTheme('#741F3F', '#C0315A', '#E84E76', '#FFD6E0'), // True rose pink
        //carmine: makeStandardTheme('#570724', '#960C3C', '#D81B60', '#F8BBD0'), // Rich red-pink

        // Reds
        cranberry: makeStandardTheme('#4C0D1C', '#721026', '#A31432', '#F4C2C9'), // Deep burgundy-cranberry
        red: makeStandardTheme('#660000', '#880000', '#C32222', '#F8C5C5'), // Classic red shades

        // Oranges and Yellows
        rust: makeStandardTheme('#8B3103', '#B54D18', '#D65C2B', '#F7D5BC'), // Deep orange-brown
        orange: makeStandardTheme('#783F04', '#B45F06', '#E6751A', '#FDD9BC'), // Bold orange shades
        yellow: makeStandardTheme('#856500', '#BF9000', '#E6AC1E', '#FFF2C4'), // Golden yellow tones

        // Greens
        green: makeStandardTheme('#294E13', '#38761D', '#4B9022', '#D6E8CE'), // Deep forest green
        moss: makeStandardTheme('#1E4D2B', '#3A7A47', '#519563', '#D4E8D1'), // Cool earthy green
        sage: makeStandardTheme('#38471F', '#596F34', '#788F4A', '#DCEADF'), // Muted green tones

        // Blues
        teal: makeStandardTheme('#004548', '#006E6E', '#008F8F', '#D1F0EC'), // Deep blue-green
        slate: makeStandardTheme('#2A4545', '#366060', '#507878', '#DEE8E8'), // Muted gray-blue
        cyan: makeStandardTheme('#0C343D', '#134F5C', '#1B657A', '#CBE5E8'), // Fresh blue-green
        blue: makeStandardTheme('#073763', '#0B5394', '#1763B8', '#CEE2F0'), // Classic blue shades
        azure: makeStandardTheme('#123A75', '#1E5BAA', '#2D70C8', '#D0E2F4'), // Bright sky blue
        skyblue: makeStandardTheme('#004080', '#0066CC', '#2E8FEA', '#D0E6F8'), // Light sky blue

        // Purples
        lavender: makeStandardTheme('#3F3677', '#5F51B7', '#776CCF', '#DAD5F2'), // Soft lavender tones
        indigo: makeStandardTheme('#20124D', '#351C75', '#483CA4', '#D5D0E3'), // Deep blue-purple
        purple: makeStandardTheme('#2D0A53', '#4B0082', '#6A0DAD', '#E6D5FF'), // Rich royal purple
        plum: makeStandardTheme('#4E1A45', '#6C3483', '#8E4FA8', '#E7D0EA'), // Warm purple-pink
        mauve: makeStandardTheme('#682F42', '#8D4659', '#A85475', '#F5D4DC'), // Dusky purple-pink

        // Neutrals    
        coral: makeStandardTheme('#762F2F', '#AF4A4A', '#D36868', '#FFE0DC'), // Warm reddish-pink
        terracotta: makeStandardTheme('#713F2D', '#9C5F4E', '#C87561', '#FAD9CE'), // Earthy orange-red
        bronze: makeStandardTheme('#5D4037', '#895D4D', '#A6705F', '#EAD6C7'), // Metallic brown
        sand: makeStandardTheme('#6A5D47', '#8C755D', '#B5937A', '#EDE0D2'), // Warm beige tones
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
