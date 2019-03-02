import * as ts from 'typescript';

export function createClassArrowFunctionPropertyTransformerFactory(): ts.TransformerFactory<ts.SourceFile> {
    return function classArrowFunctionPropertyTransformerFactory(
        context: ts.TransformationContext
    ): ts.Transformer<ts.SourceFile> {
        const visitor: ts.Visitor = (node: ts.Node) => {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.ClassExpression: {
                    const boundClassMethods: string[] = [];
                    const hasParentClass: boolean = Boolean(
                        (node as ts.ClassDeclaration | ts.ClassExpression).heritageClauses
                    );
                    let hasConstructor: boolean = false;
                    const arrowFunctionPropertyVisitor: ts.Visitor = (node: ts.Node) => {
                        switch (node.kind) {
                            case ts.SyntaxKind.PropertyDeclaration: {
                                const propDeclNode: ts.PropertyDeclaration = node as ts.PropertyDeclaration;
                                const {initializer, name} = propDeclNode;

                                if (initializer && name && initializer.kind === ts.SyntaxKind.ArrowFunction) {
                                    const arrFn: ts.ArrowFunction = initializer as ts.ArrowFunction;
                                    const methodName: string = name.getText();

                                    boundClassMethods.push(methodName);
                                    return ts.createMethod(
                                        arrFn.decorators,
                                        arrFn.modifiers,
                                        undefined,
                                        methodName,
                                        propDeclNode.questionToken,
                                        arrFn.typeParameters,
                                        arrFn.parameters,
                                        propDeclNode.type,
                                        arrFn.body.kind === ts.SyntaxKind.Block
                                            ? (arrFn.body as ts.Block)
                                            : ts.createBlock([ts.createReturn(arrFn.body)])
                                    );
                                }
                            }
                        }

                        return ts.visitEachChild(node, arrowFunctionPropertyVisitor, context);
                    };
                    const addBoundMethodsToConstructor = (
                        constructorNode: ts.ConstructorDeclaration
                    ): ts.ConstructorDeclaration => {
                        const {body} = constructorNode;

                        return ts.createConstructor(
                            constructorNode.decorators,
                            constructorNode.modifiers,
                            constructorNode.parameters,
                            ts.createBlock([
                                ...((body && body.statements) || []),
                                ...boundClassMethods.map((name: string) => {
                                    return ts.createExpressionStatement(
                                        ts.createBinary(
                                            ts.createPropertyAccess(ts.createThis(), name),
                                            ts.createToken(ts.SyntaxKind.EqualsToken),
                                            ts.createCall(
                                                ts.createPropertyAccess(
                                                    ts.createPropertyAccess(ts.createThis(), name),
                                                    'bind'
                                                ),
                                                undefined,
                                                [ts.createThis()]
                                            )
                                        )
                                    );
                                })
                            ])
                        );
                    };
                    const constructorVisitor: ts.Visitor = (node: ts.Node) => {
                        switch (node.kind) {
                            case ts.SyntaxKind.Constructor: {
                                hasConstructor = true;
                                return addBoundMethodsToConstructor(node as ts.ConstructorDeclaration);
                            }
                        }

                        return ts.visitEachChild(node, constructorVisitor, context);
                    };

                    node = ts.visitEachChild(node, arrowFunctionPropertyVisitor, context);
                    node = ts.visitEachChild(node, constructorVisitor, context);

                    if (!hasConstructor) {
                        const spreadArgsName: string = 'args';
                        const constructorNode: ts.ConstructorDeclaration = addBoundMethodsToConstructor(
                            ts.createConstructor(
                                undefined,
                                undefined,
                                hasParentClass
                                    ? [
                                          ts.createParameter(
                                              undefined,
                                              undefined,
                                              ts.createToken(ts.SyntaxKind.DotDotDotToken),
                                              spreadArgsName
                                          )
                                      ]
                                    : [],
                                ts.createBlock(
                                    hasParentClass
                                        ? [
                                              ts.createExpressionStatement(
                                                  ts.createCall(ts.createSuper(), undefined, [
                                                      ts.createSpread(ts.createIdentifier(spreadArgsName))
                                                  ])
                                              )
                                          ]
                                        : []
                                )
                            )
                        );

                        if (ts.SyntaxKind.ClassDeclaration) {
                            const classDeclNode: ts.ClassDeclaration = node as ts.ClassDeclaration;

                            return ts.createClassDeclaration(
                                classDeclNode.decorators,
                                classDeclNode.modifiers,
                                classDeclNode.name,
                                classDeclNode.typeParameters,
                                classDeclNode.heritageClauses,
                                [constructorNode, ...classDeclNode.members]
                            );
                        }

                        const classExprNode: ts.ClassExpression = node as ts.ClassExpression;

                        return ts.createClassExpression(
                            classExprNode.modifiers,
                            classExprNode.name,
                            classExprNode.typeParameters,
                            classExprNode.heritageClauses,
                            [constructorNode, ...classExprNode.members]
                        );
                    }

                    return node;
                }
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return function classArrowFunctionPropertyTransformer(sourceFile: ts.SourceFile): ts.SourceFile {
            return ts.visitNode(sourceFile, visitor);
        };
    };
}
