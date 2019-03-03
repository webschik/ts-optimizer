const ts = require('typescript');
const {createClassArrowFunctionPropertyTransformerFactory} = require('../../src/transformers/class-arrow-function-property');

describe('Transformers', () => {
    describe('ClassArrowFunctionProperty', () => {
        const printer = ts.createPrinter();

        it('should convert class arrow function to bound methods', () => {
            const inputFile = ts.createSourceFile(
                'test.ts',
                `
                    class Button1 {
                        private fn1 = (a, b) => {};
                        protected fn2 = () => {};
                        fn3 = () => {
                          return 2;
                        } 
                        
                        render () {
                            return <button />
                        }
                    }
                    
                    class Button2 extends React.Component {
                        private fn1 = (a, b) => {};
                        protected fn2 = () => {};
                        fn3 = () => {
                          return 2;
                        }  
                        
                        render () {
                            return <button />
                        }
                    }
                    
                    class Button3 extends React.Component {
                        constructor (props) {
                            super(props);
                            this.state = {};
                        }
                    
                        private fn1 = (a, b) => {};
                        protected fn2 = () => {};
                        fn3 = () => 2
                        
                        render () {
                            return <button />
                        } 
                    }
                `,
                ts.ScriptTarget.ESNext,
                true,
                ts.ScriptKind.TSX
            );
            const result = ts.transform(inputFile, [
                createClassArrowFunctionPropertyTransformerFactory()
            ]);
            const [outputFile] = result.transformed;

            expect(outputFile).toBeDefined();
            const outputFileText = printer.printFile(outputFile);

            expect(printer.printFile(inputFile)).not.toBe(outputFileText);
            expect(outputFileText).toMatchSnapshot();
        });
    });
});