


function generateError(errorCode, errorMessage) {
    return {
        code: errorCode,
        message: errorMessage
    };
}

exports.generateError = generateError;