const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const utils = require("./utils");

const logger = utils.getLogger();

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
        sgMail.send(options)
            .catch((error) => {
                logger.error("Email not sent\n", error);
            });
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
        sendPasswordResetLink: (name, recipient, resetUrl, token) => {

            let source = fs.readFileSync(path.join(__dirname, "../templates/reset-password.hbs"), "utf8");
            let template = Handlebars.compile(source);

            send(recipient, "Password Reset", "Reset Password Link", template({name, resetUrl, token}));
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
        },

        /*
        * Method to send welcome email
        *
        * @params:
        * name - String
        * recipient - String email
        * verificationUrl - String url
        * token - String
        * */
        sendWelcomeEmail: (name, recipient, verificationUrl, token) => {

            let source = fs.readFileSync(path.join(__dirname, "../templates/welcome.hbs"), "utf8");
            let template = Handlebars.compile(source);

            send(recipient, "Welcome to MasterDrive", "Welcome to MasterDrive", template({name, verificationUrl, token}));

        }

    };

})();

module.exports = email;