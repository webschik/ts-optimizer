const getCustomTransformers = require('../src/ts-transformers');

describe('getCustomTransformers()', () => {
    it('should export a config for TS loaders with a list of transformers', () => {
        expect(getCustomTransformers()).toEqual({
            before: [
                expect.any(Function),
                expect.any(Function)
            ]
        });
    });
});