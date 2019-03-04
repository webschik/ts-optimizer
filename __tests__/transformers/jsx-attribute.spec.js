const ts = require('typescript');
const createJsxAttributeTransformerFactory = require('../../src/transformers/jsx-attribute');

describe('Transformers', () => {
    describe('JsxAttribute', () => {
        const printer = ts.createPrinter();

        it('should remove leading and trailing spaces in template literals', () => {
            const inputFile = ts.createSourceFile(
                'test.ts',
                `
                    export default class Element {
                        render () {
                            const className1 = 'className1';
                            const className2 = 'className2';
    
                            return (
                                <div>
                                    <button className={\`search-control__close-button\${value ? \` \${visibleCloseButtonClassName}\` : ''}\`} />
                                    <button disabled
                                            class={\`item   \${className1}  \${className2}  item2\`}
                                            className={\`
                                                \${className1}
                                                \${\`
                                                    \${className2}
                                                \`}
                                            \`}
                                    />
                                    <button className={\`
                                                        item
                                                        item2
                                                        item3
                                                    \`} />
                                </div>
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
            expect(outputFileText).toContain('className={`search-control__close-button${value ? ` ${visibleCloseButtonClassName}` : \'\'}`}');
            expect(outputFileText).toContain('class={`item ${className1} ${className2} item2`}');
            expect(outputFileText).toContain('className={`${className1} ${`${className2}`}`}');
            expect(outputFileText).toContain('className={`item item2 item3`}');
            expect(outputFileText).toMatchSnapshot();
        });
    });
});