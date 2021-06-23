import 'mocha';
import {expect} from 'chai';
import { UUIDHelper, UUIDError } from '../../../api/src/helpers/UUIDHelper';

describe('UUID helper', () =>{
    const BASE0 = 'AAAAAAAAAAAAAAAAAAAAAA';
    const BASEWRONG = 'AAAAAAAAAAAAAAAAAAAAAB';
    const UUID0 = '00000000-0000-0000-0000-000000000000';
    const generateHex = () => Math.floor(Math.random()*16).toString(16);
    const generateHexes = (length : number) => [...Array(length)].map(generateHex).join('');
    const generate_uuid = () => {
        //uuids are in the form 8-4-4-4-12
        return [8, 4, 4, 4, 12].map(generateHexes).join('-');
    }
    it("Should convert a base64 value to a UUID", () =>{
        expect(UUIDHelper.toUUID(BASE0)).to.equal(UUID0);
    });
    it("Should convert a UUID to a base64 value", () =>{
        expect(UUIDHelper.fromUUID(UUID0)).to.equal(BASE0);
    });
    it("Should always give back the same after applying both transformations", () =>{
        for (var i=0;i<1000;i++){
            const start = generate_uuid();
            const end = UUIDHelper.toUUID(UUIDHelper.fromUUID(start));
            expect(start).to.equal(end);
        }
    })
    it("should throw an error when it receives a faulty base64 value", () =>{
        expect(()=>UUIDHelper.toUUID(BASEWRONG)).to.throw(UUIDError, /.* is not a valid base64 representation of a UUID./);//throw any error of type UUIDError
    })
})