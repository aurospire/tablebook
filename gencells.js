function generateColorColumns() {
    const colors = {
        redberry:       ['#5B0F00', '#85200C', '#E6B8AF'],
        red:            ['#660000', '#990000', '#F4CCCC'],
        coral:          ['#652b2b', '#af4a4a', '#ffd7d7'],
        bronze:         ['#5D4037', '#895d4d', '#D7CCC8'],
        orange:         ['#783F04', '#B45F06', '#FCE5CD'],
        rust:           ['#8B3103', '#B54D18', '#F5DEB3'],
        yellow:         ['#7F6000', '#BF9000', '#FFF2CC'],
        green:          ['#274E13', '#38761D', '#D9EAD3'],
        moss:           ['#1E4D2B', '#3A7A47', '#D4E4D4'],
        sage:           ['#38471f', '#596f34', '#D5E8D4'],
        slate:          ['#223939', '#2f4f4f', '#E0E6E6'],
        cyan:           ['#0C343D', '#134F5C', '#D0E0E3'],
        cornflowerblue: ['#1C4587', '#1155CC', '#C9DAF8'],
        blue:           ['#073763', '#0B5394', '#CFE2F3'],
        lavender:       ['#3f3677', '#5f51b7', '#E6E6FA'],
        plum:           ['#4E1A45', '#6C3483', '#E8DAEF'],
        magenta:        ['#4C1130', '#65183E', '#B3A0A8'],
        purple:         ['#20124D', '#351C75', '#D9D2E9'],
        gray:           ['#3b3b3b', '#656565', '#F2F2F2'],
    };

    // Clear the document
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.fontSize ='11px';
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'row';
    document.body.style.gap = '0';
    document.body.style.flexWrap='wrap';

    // Create the color columns
    for (const [colorName, shades] of Object.entries(colors)) {
        const column = document.createElement('div');
        column.style.display = 'flex';
        column.style.flexDirection = 'column';
        column.style.gap = '0';

        shades.forEach((shade, index) => {
            const box = document.createElement('div');
            box.style.backgroundColor = shade;
            box.style.width = '100px';
            box.style.height = '20px';
            box.style.display = 'flex';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            

            if (index < 2) {
                box.style.color = 'white';
                box.style.fontWeight = 'bold';
            } else {
                box.style.color = 'black';
            }

            box.textContent = colorName + (index + 1);
            column.appendChild(box);
        });

        document.body.appendChild(column);
    }
}

generateColorColumns();