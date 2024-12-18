import { v } from 'varcor';
import { GoogleSheet } from './sheets/google/GoogleSheet';
import { Colors } from './tables/types';
import { SheetRange } from './sheets/SheetCell';

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
        await sheet.modify(r => r.mergeCells(id, SheetRange.box(3, 3, 3, 3)));

        await sheet.modify(r => r.setBorder(id, SheetRange.box(3, 3, 3, 3,), {
            top: { color: Colors.toObject('#ab2010'), type: 'dashed' },
            bottom: { color: Colors.toObject('#008800'), type: 'thick' },
            left: { color: Colors.toObject('#990022'), type: 'dotted' },
            right: { color: Colors.toObject('#8800AA'), type: 'double' },
        }));

        await sheet.modify(r => r.updateCell(id, 3, 3, { value: 10, bold: true, fore: Colors.toObject('#990022') }));
        await sheet.modify(r => r.updateCell(id, 3, 3, { value: { formula: '10+22' } }));
    }
};


main();