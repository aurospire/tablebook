import { TableBook as FullTableBook } from "@/tables/types";
import { TableBook as CompressedTableBook } from "@/tables/compressed";
import { expectType } from 'jestype';
describe('Testing for type equality', () => {
    it('Should be the same type', () => {
        expectType<FullTableBook>().toBe<CompressedTableBook>();
        expectType<CompressedTableBook>().toBe<FullTableBook>();
    });
});