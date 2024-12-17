import { v } from 'varcor';
import { GoogleSheet } from './util/sheets/GoogleSheet';
import { Colors } from './types/types';

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