module.exports = {
    createPassword: () => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for(let i = 0; i < 6; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    },

    createUsername: () => {
        let result = '';
        let characters = '0123456789';
        let charactersLength = characters.length;
        for(let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
       return result;
    },
    createOTP: () => {
        let result = '';
        let characters = '0123456789';
        let charactersLength = characters.length;
        for(let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
       return result;
    },
    createModileOperator: () => {
        let result = '';
        let characters = '0123456789';
        let charactersLength = characters.length;
        for(let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
       return result;
    },
}

