import { v } from 'varcor';

const vars = v.values({
    email: v.string().email(),
    key: v.string()
}, v.data.jsonFile('.env.json').toDataObject());

console.log(vars);