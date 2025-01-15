// const vars = v.values({
//     email: v.string().email(),
//     key: v.string(),
//     sheetid: v.string()
// }, v.data.jsonFile('.env.json').toDataObject());


// console.log(vars);


// const testTablebook = async (tablebook: TableBook) => {

//     const result = TableBookValidator.safeParse(tablebook);
//     if (result.success) {
//         const sheet = await GoogleSheet.open(vars.email, vars.key, vars.sheetid);

//         const generator = new GoogleGenerator(sheet);

//         const sheetbook = processTableBook(result.data);

//         await generator.generate(sheetbook);

//         // console.log(inspect(sheetbook, { depth: null, colors: true }));
//     }
//     else {
//         console.log('Tablebook validation failed');
//         console.log(inspect(result.error, { depth: null, colors: true }));
//     }
// };

export * from './tables/types';
export * from './sheets';
export * from './google';
export * from './util';
export * from './generate';