import {createClassArrowFunctionPropertyTransformerFactory} from './transformers/class-arrow-function-property';
import {createJsxAttributeTransformerFactory} from './transformers/jsx-attribute';

module.exports = function getCustomTransformers() {
    return {
        before: [
            createJsxAttributeTransformerFactory({
                attributesWithTemplateLiterals: ['className', 'class']
            }),
            createClassArrowFunctionPropertyTransformerFactory()
        ]
    };
};
