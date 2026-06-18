import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { FormZen } from "../dist/index.js";

before(() => {
    const dom = new JSDOM(`
        <form id="myForm"></form>
    `);

    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLInputElement = dom.window.HTMLInputElement;
    global.HTMLSelectElement = dom.window.HTMLSelectElement;
    global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    global.HTMLButtonElement = dom.window.HTMLButtonElement;
    global.HTMLFormElement = dom.window.HTMLFormElement;
    global.HTMLDivElement = dom.window.HTMLDivElement;
});


describe("FormZen", () => {
    it("should return form data", () => {
        const formZen = new FormZen("#myForm", {
            email: {
                label: "Email",
                type: "email",
                required: true
            },

            password: {
                label: "Password",
                type: "password",
                required: true
            }
        });

        const email = document.querySelector('[name="email"]');
        const password = document.querySelector('[name="password"]');

        email.value = "a@a.com";
        password.value = "1234";

        let received = null;

        formZen.addCallback((data) => {
            received = data;
        });

        formZen.emitSubmit();

        assert.deepStrictEqual(received, {
            email: "a@a.com",
            password: "1234"
        });
    });
});