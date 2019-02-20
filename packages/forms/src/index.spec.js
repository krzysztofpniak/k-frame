const expect = require('chai').expect;
import {
    validateForm,
    validateField,
} from '../src/view';
import {
    required,
} from './validators';
import {getInitialModel} from '../src/updater';

describe('validateForm', () => {
    it('should accept empty schema', () => {
        const result = validateForm([], getInitialModel());

        expect(result).to.deep.equal([]);
    });

    describe('with required attribute', () => {
        it('should return error when name is undefined', () => {
            const result = validateForm([{
                id: 'name',
                validate: required,
            }], getInitialModel());

            expect(result).to.deep.equal([{id: "name", error: 'This field is required'}]);
        });

        it('should return error when name is empty', () => {
            const result = validateForm([{
                id: 'name',
                validate: required,
            }], getInitialModel({name: ''}));

            expect(result).to.deep.equal([{id: "name", error: 'This field is required'}]);
        });

        it('should return no errors when name is filled', () => {
            const result = validateForm([{
                id: 'name',
                validate: required,
            }], getInitialModel({name: 'John'}));

            expect(result).to.deep.equal([]);
        });
    });

    describe('without required attribute', () => {
        it('should not validate optional fields', () => {
            const result = validateForm([{
                id: 'name',
                validate: required,
            },{
                id: 'surname',
            }], getInitialModel());

            expect(result).to.deep.equal([{id: "name", error: 'This field is required'}]);
        });
    });
});

describe('validateField', () => {
    it('should accept empty model', () => {
        const result = validateField({
            id: 'name',
            validate: required
        }, getInitialModel());

        expect(result).to.deep.equal('This field is required');
    });

    it('should accept valid model', () => {
        const result = validateField({
            id: 'name',
            validate: required
        }, getInitialModel({name: 'John'}));

        expect(result).to.deep.equal('');
    });

    it('should check required first', () => {
        const result = validateField({
            id: 'name',
            validate: [required, f => f.length > 5 ? 'Max length is 5' : ''],
        }, getInitialModel({name: ''}));

        expect(result).to.deep.equal('This field is required');
    });

    describe('custom validation', () => {
        it('should show message', () => {
            const result = validateField({
                id: 'name',
                validate: [required, f => f.length > 5 ? 'Max length is 5' : ''],
            }, getInitialModel({name: 'John Lemon'}));

            expect(result).to.deep.equal('Max length is 5');
        });

        it('should pass', () => {
            const result = validateField({
                id: 'name',
                validate: [required, f => f.length > 5 ? 'Max length is 5' : ''],
            }, getInitialModel({name: 'John'}));

            expect(result).to.deep.equal('');
        });
    });
});
