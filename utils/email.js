const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
let defaultRecipient = process.env.TEST_EMAIL_ID;

let email = (() => {

    /*
    * Method to send the email
    *
    * @params:
    * to - String recipient email
    * subject - String Email subject line
    * text - String Email body in text format
    * html - String Email body in HTML format
    * */
    let send = (to, subject, text, html) => {
        let from = process.env.INFO_EMAIL_ID;
        let options = {from, subject, text, html};
        options.to = defaultRecipient || to;
        sgMail.send(options);
    };

    return {

        /*
        * Method to send the password reset link
        *
        * @params:
        * name - String
        * recipient - String email
        * reset_url - String url
        * token - String
        * */
        sendPasswordResetLink: (name, recipient, reset_url, token) => {

            let source = fs.readFileSync(path.join(__dirname, "../templates/reset-password.hbs"), "utf8");
            let template = Handlebars.compile(source);

            send(recipient, "Password Reset", "Reset Password Link", template({name, reset_url, token}));
        },

        /*
        * Method to send information update email confirmation
        *
        * @params:
        * name - String
        * recipient - String email
        * */
        sendDetailsUpdatedConfirmation: (name, recipient) => {

            let source = fs.readFileSync(path.join(__dirname, "../templates/details-updated.hbs"), "utf8");
            let template = Handlebars.compile(source);

            send(recipient, "Information Update Confirmation", "Information Update Confirmation", template({name}));
        }

    };

})();

module.exports = email;