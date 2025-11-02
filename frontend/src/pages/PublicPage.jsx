import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import TextTree from "../components/TextTree/TextTree";
import { getTree, getSingleText, getFooter } from "../api";

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
            <Navbar />
            <main style={{padding: "20px", maxWidth: 900, margin: "0 auto"}}>
                <section style={{marginBottom: 30}}>
                    <h2>Семейное дерево Антипиных</h2>
                    <TextTree items={items} />
                </section>

                <section style={{marginBottom: 30}}>
                    <h2>Блок сплошного текста</h2>
                    <div dangerouslySetInnerHTML={{__html: singleText}} />
                </section>
            </main>
            <Footer html={footer?.html || ""} />
        </div>
    );
}
