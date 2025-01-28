import { tablebook, TableBook } from 'tablebook';
import { inspect } from 'util';
import { v } from 'varcor';

const main = async () => {

    const settings = v.values({
        email: v.string().email(),
        key: v.string(),
        sheetId: v.string(),
    }, v.data.jsonFile('.env.json'));

    console.log(settings);

    const book: TableBook = {
        name: "Book",
        theme: '@blue',
        pages: [
            {
                name: 'Page1',
                rows: 10,
                groups: [
                    {
                        name: 'Group1',
                        columns: [
                            {
                                name: 'Column1',
                                type: { kind: 'text' }
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const vr = tablebook.validate(book);

    if (!vr.success)
        return console.error(inspect(vr.info, { depth: null, colors: false }));

    const pr = tablebook.process(vr.value);

    if (!pr.success)
        return console.error(inspect(pr.info, { depth: null, colors: false }));

    const generator = await tablebook.generators.google(settings.email, settings.key, settings.sheetId, true);

    const gr = await tablebook.generate(pr.value, generator);

    if (!gr.success)
        return console.error(inspect(gr.info, { depth: null, colors: false }));
};

main()
