class JSClipboard {
    constructor() {
        this.htmldata = "";
        this.plaindata = "";
        this.intercept = false;
        window.addEventListener("copy", event => this.hook(event));
    }
    hook(evt) {
        //  console.log('jscopy.hook called',this,evt)
        if (this.intercept) {
            //  console.log('evt',evt)
            evt.preventDefault();
            if (this.htmldata != "") {
                evt.clipboardData.setData("text/html", this.htmldata);
            }
            if (this.plaindata != "") {
                evt.clipboardData.setData("text/plain", this.plaindata);
            }
            //            evt.clipboardData.setData('text/plain', JSClipboard.plaindata);
            this.intercept = false;
        }
    }
    copyHtml(htmldata, plaindata) {
        this.htmldata = htmldata;
        this.plaindata = plaindata;
        if (window.clipboardData) {
            window.clipboardData.setData("Text", this.htmldata);
            return true;
        } else {
            this.intercept = true;
            return document.execCommand("copy");
        }
    }
    copy(plaindata) {
        this.plaindata = plaindata;
        if (window.clipboardData) {
            window.clipboardData.setData("Text", this.plaindata);
            return true;
        } else {
            this.intercept = true;
            return document.execCommand("copy");
        }
    }
}

window.JSClipboard = JSClipboard;

export default JSClipboard;