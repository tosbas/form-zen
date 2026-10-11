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
    it("should invoke the constructor submit callback", () => {
        let received = null;

        new FormZen("#myForm", {
            name: {
                label: "Name",
                type: "text"
            }
        }, (data) => {
            received = data;
        });

        const name = document.querySelector('[name="name"]');
        name.value = "Ada";

        const form = document.querySelector("#myForm form");
        form.dispatchEvent(new window.Event("submit", {
            bubbles: true,
            cancelable: true
        }));

        assert.deepStrictEqual(received, { name: "Ada" });
    });

    it("should accept the submit button label and type in the constructor", () => {
        const root = document.createElement("div");
        root.id = "submit-button-test";
        document.body.appendChild(root);

        const formZen = new FormZen(`#${root.id}`, {}, undefined, "Continue", "button");
        const button = root.querySelector("button");

        assert.equal(button.textContent, "Continue");
        assert.equal(button.type, "button");

        formZen.addButtonSubmit("Reset", "reset");

        assert.equal(root.querySelectorAll("button").length, 1);
        assert.equal(root.querySelector("button").type, "reset");
        root.remove();
    });

    it("should accept submit button options as an object", () => {
        const root = document.createElement("div");
        root.id = "submit-button-options-test";
        document.body.appendChild(root);

        new FormZen(`#${root.id}`, {}, undefined, {
            label: "Continue",
            type: "button"
        });

        const button = root.querySelector("button");
        assert.equal(button.textContent, "Continue");
        assert.equal(button.type, "button");
        root.remove();
    });

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