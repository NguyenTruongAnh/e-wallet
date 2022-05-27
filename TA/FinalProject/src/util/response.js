module.exports = {
    formatResponse: function(code,message,data) {
        if(data)
            return { code, message, data }
        return { code, message }
    }
}