const ts = require('typescript');
const {createJsxAttributeTransformerFactory} = require('../../src/transformers/jsx-attribute');

describe('Transformers', () => {
    describe('JsxAttribute', () => {
        const printer = ts.createPrinter();

        it('should remove leading and trailing spaces in template literals', () => {
            const inputFile = ts.createSourceFile(
                'test.ts',
                `
                    export default class Button {
                        render () {
                            const className1 = 'className1';
                            const className2 = 'className2';
    
                            return (
                                <button disabled
                                        class={\`   \${className1}  \${className2}  \`}
                                        className={\`
                                            \${className1}
                                            \${\`
                                                \${className2}    
                                            \`}
                                        \`}
                                />
                            );
                        }
                    }
                `,
                ts.ScriptTarget.ESNext,
                true,
                ts.ScriptKind.TSX
            );
            const result = ts.transform(inputFile, [
                createJsxAttributeTransformerFactory({
                    attributesWithTemplateLiterals: ['className', 'class']
                })
            ]);
            const [outputFile] = result.transformed;

            expect(outputFile).toBeDefined();
            const outputFileText = printer.printFile(outputFile);

            expect(printer.printFile(inputFile)).not.toBe(outputFileText);
            expect(outputFileText).toMatchSnapshot();
        });
    });
});