import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import TextTree from "../components/TextTree/TextTree";
import { getTree, getSingleText, getFooter } from "../api";

import { Element, scroller } from "react-scroll";
import { useLocation } from "react-router-dom";


export default function PublicPage() {
    const [items, setItems] = useState([]);
    const [singleText, setSingleText] = useState("");
    const [footer, setFooter] = useState(null);
    const location = useLocation();

    useEffect(() => {
        getTree().then(setItems);
        getSingleText().then(d=>setSingleText(d.content || ""));
        getFooter().then(setFooter);
    }, []);

    useEffect(() => {
        if (location.hash) {
            const target = location.hash.replace("#", "");
            scroller.scrollTo(target, {
                smooth: true,
                duration: 600,
                offset: -80,
            });
        }
    }, [location]);

    return (
        <div>
            <Element name="top" />

            <Navbar />

            <main style={{padding: "20px", maxWidth: 1200, margin: "0 auto"}}>

                <section style={{marginBottom: 30}}>
                    <h2>Семейное дерево Антипиных</h2>
                    <TextTree items={items} />
                </section>

                <Element name="about">
                    <section style={{marginBottom: 30}}>
                        <h3>История семьи Антипиных</h3>
                        <div dangerouslySetInnerHTML={{ __html: singleText }} />
                    </section>
                </Element>

            </main>

            <Element name="contacts">
                <Footer html={footer?.html || ""} />
            </Element>
        </div>
    );
}
