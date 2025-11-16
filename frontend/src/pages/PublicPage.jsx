import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import TextTree from "../components/TextTree/TextTree";
import { getTree, getSingleText, getFooter } from "../api";

import { Element } from "react-scroll";


export default function PublicPage() {
    const [items, setItems] = useState([]);
    const [singleText, setSingleText] = useState("");
    const [footer, setFooter] = useState(null);

    useEffect(() => {
        getTree().then(setItems);
        getSingleText().then(d=>setSingleText(d.content || ""));
        getFooter().then(setFooter);
    }, []);

    return (
        <div>
            <Element name="top"></Element>
            <Navbar />
            <main style={{padding: "20px", maxWidth: 900, margin: "0 auto"}}>
                <section style={{marginBottom: 30}}>
                    <h2>Семейное дерево Антипиных</h2>
                    <TextTree items={items} />
                </section>
                <Element name="about">
                    <section style={{marginBottom: 30}}>
                        <h3>История семьи Антипиных</h3>
                        <div dangerouslySetInnerHTML={{__html: singleText}} />
                    </section>
                </Element>
            </main>
            <Element name="contacts">
                <Footer html={footer?.html || ""} />
            </Element>
        </div>
    );
}
