module.exports = function getCustomTransformers() {
    return {
        before: [
            require('./transformers/jsx-attribute')({
                attributesWithTemplateLiterals: ['className', 'class']
            }),
            require('./transformers/class-arrow-function-property')()
        ]
    };
};
