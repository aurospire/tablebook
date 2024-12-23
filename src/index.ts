import { v } from 'varcor';
import { GoogleSheet } from './sheets/google/GoogleSheet';
import { SheetPosition, SheetRange } from './sheets/SheetPosition';
import { Colors } from './util/Color';

const main = async () => {

    const vars = v.values({
        email: v.string().email(),
        key: v.string(),
        sheetid: v.string()
    }, v.data.jsonFile('.env.json').toDataObject());

    console.log(vars);

    // const api = await GoogleSheetGenerator.login(vars.email, vars.key);

    // await GoogleSheetGenerator.resetBook(api, vars.sheetid);
    // const results = await GoogleSheetGenerator.getSheetIds(api, vars.sheetid);
    // console.log(results);

    const sheet = await GoogleSheet.open(vars.email, vars.key, vars.sheetid);

    await sheet.reset();


    const id = await sheet.addSheet({
        color: Colors.toObject('#990022'),
        rows: 10,
        columns: 10,
    });

    if (id) {
        await sheet.modify(r => r.mergeCells(id, SheetRange.region(3, 3)));

        await sheet.modify(r => r.setBorder(id, SheetRange.region(3, 3,), {
            top: { color: Colors.toObject('#ab2010'), type: 'dashed' },
            bottom: { color: Colors.toObject('#008800'), type: 'thick' },
            left: { color: Colors.toObject('#990022'), type: 'dotted' },
            right: { color: Colors.toObject('#8800AA'), type: 'double' },
        }));

        await sheet.modify(r => r.updateCells(id, SheetRange.cell(3, 3), { value: 10, bold: true, fore: Colors.toObject('#990022') }));
        await sheet.modify(r => r.updateCells(id, SheetRange.cell(3, 3), { value: 'hello\n\t"World"!' }));

        await sheet.modify(r => r
            .updateCells(id, SheetRange.cell(0, 0), { value: 10 })
            .updateCells(id, SheetRange.cell(0, 1), { value: 5 })
            .updateCells(id, SheetRange.cell(0, 2), {
                value: {
                    type: 'compound', with: '+', items: [
                        { type: 'selector', from: { start: { col: "$0", row: "$0" } } },
                        { type: 'selector', from: { start: { col: "$0", row: "$1" } } },
                    ]
                }
            })
        );

        await sheet.modify(r => r.updateCells(id, SheetRange.region(1, 1, 2, 2), { back: Colors.toObject('#333333') }));
    }
};


main();