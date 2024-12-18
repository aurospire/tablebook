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

    if (id)
        sheet.modify(r => r.mergeCells(id, SheetRange.box(3, 3, 3, 3)));

    return;
    //await sheet.reset(); return;
    console.log(await sheet.getSheetIds());

    await sheet.setTitle('New Title!');

    await sheet.addSheet({
        color: Colors.toObject('#990022'),
        rows: 10,
        columns: 3,
    });
};


main();