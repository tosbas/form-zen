import { FormZen } from "./dist/index.js";

const form = new FormZen(
    "#myForm",
    {
        email: {
            label: "Email",
            type: "email",
            required: true
        },

        password: {
            label: "Password",
            type: "password",
            required: true
        },

        bio: {
            label: "Bio",
            type: "textarea"
        },

        hobbies: {
            label: "Hobbies",
            type: "select",
            options: [
                "Sport",
                "Music"
            ],
            multiple: true
        }
    },
    (data) => {
        console.log(data);
    }
);