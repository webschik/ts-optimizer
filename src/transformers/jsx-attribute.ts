import * as ts from 'typescript';

export interface JsxAttributeTransformerOptions {
    attributesWithTemplateLiterals?: string[];
}

const multipleSpacesPattern: RegExp = /\s{2,}/;

module.exports = function createJsxAttributeTransformerFactory(
    options: JsxAttributeTransformerOptions
): ts.TransformerFactory<ts.SourceFile> {
    const attributesWithTemplateLiterals: string[] = Array.isArray(options.attributesWithTemplateLiterals)
        ? options.attributesWithTemplateLiterals
        : [];

    return function jsxAttributeTransformerFactory(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
        const attributeWithTemplateLiteralVisitor: ts.Visitor = (node: ts.Node) => {
            switch (node.kind) {
                case ts.SyntaxKind.TemplateHead: {
                    const text: string = (node as ts.TemplateHead).text.trimLeft();

                    node = ts.createTemplateHead(text && text.replace(multipleSpacesPattern, ' '));
                    break;
                }
                case ts.SyntaxKind.TemplateMiddle: {
                    node = ts.createTemplateMiddle((node as ts.TemplateMiddle).text.replace(multipleSpacesPattern, ' '));
                    break;
                }
                case ts.SyntaxKind.TemplateTail: {
                    const text: string = (node as ts.TemplateTail).text.trimRight();

                    node = ts.createTemplateTail(text && text.replace(multipleSpacesPattern, ' '));
                    break;
                }
            }

            return ts.visitEachChild(node, attributeWithTemplateLiteralVisitor, context);
        };

        const visitor: ts.Visitor = (node: ts.Node) => {
            switch (node.kind) {
                case ts.SyntaxKind.JsxAttribute: {
                    const {name} = node as ts.JsxAttribute;

                    if (name && attributesWithTemplateLiterals.includes(name.getText())) {
                        return ts.visitEachChild(node, attributeWithTemplateLiteralVisitor, context);
                    }
                }
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return function jsxAttributeTransformer(sourceFile: ts.SourceFile): ts.SourceFile {
            return ts.visitNode(sourceFile, visitor);
        };
    };
}
