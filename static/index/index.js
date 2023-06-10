class Project extends HTMLElement {
    connectedCallback() {
        const a = document.createElement("a");
        const img = document.createElement("img");
        const div = document.createElement("div");
        const h1 = document.createElement("h1");

        a.href = this.getAttribute("link");
        a.className = "project"
        a.target = "_blank";

        img.src = this.getAttribute("img");

        div.className = "info";
        h1.className = "project-title";
        h1.innerHTML = this.getAttribute("title");

        div.appendChild(h1);
        a.appendChild(img);
        a.appendChild(div);
        this.appendChild(a);
    }
}

customElements.define("project-link", Project);
