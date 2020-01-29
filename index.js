'use strict';

const { map, flow, reduce, groupBy, toPairs, get, set, curry, isEmpty, forEach } = _;

const r1 = (cnt, obj = {}) => {
    return cnt === 0 ? obj : r1(--cnt, { [cnt]: { ...obj } });
}

const r2 = (cnt) => {
    if (cnt == 0) return;
    return { [cnt]: r2(--cnt) };
}

const r3 = (cnt) => {
    let obj = {};
    while (cnt > 0) {
        --cnt;
        obj = { [cnt]: { ...obj } };
    }
    return obj;
}

const parseXmlFromString = data => new DOMParser().parseFromString(data, 'text/xml');

const xmlToObject = (node) => {
    if (node.childNodes.length === 0) return undefined;
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) return node.childNodes[0].data;
    
    return reduce((a, [k, v]) => {
        (k !== '#text') && (a[k] = (v.length === 1) ? xmlToObject(v[0]) : map(xmlToObject, v));
        return a;
    }, {}, flow(groupBy('nodeName'), toPairs)(node.childNodes));
};

const toArray = (propName, obj) => {
    const a = get(propName, obj);
    if (!a) return [];
    return (a instanceof Array) ? a : [a];
};

const valueToArray = curry((propName, obj) => set(propName, toArray(propName, obj), obj));

const fmap = fn => arg => (arg instanceof Promise ? arg.then(fn) : fn(arg));
const asyncFlow = (...fs) => flow(map(f => fmap(f), fs));

const xml = `
<response>
    <result>
        <anagrafica>
            <record>
                <codice_cliente>5</codice_cliente>
                <rag_soc>Miami American Cafe</rag_soc>
                <codice_fiscale>IT07654930130</codice_fiscale>
                <num_prodotti>13</num_prodotti>
            </record>
            <record>
                <codice_cliente>302</codice_cliente>
                <rag_soc>Filiberto Gilardi</rag_soc>
                <codice_fiscale>IT87654770157</codice_fiscale>
                <indirizzo tipo="ufficio">Via Biancospini 20, Messina</indirizzo>
                <num_prodotti>8</num_prodotti>
            </record>
            <record>
                <codice_cliente>1302</codice_cliente>
                <rag_soc>Eidon</rag_soc>
                <codice_fiscale>IT887511231</codice_fiscale>
                <indirizzo tipo="ufficio">Via Bassini 17/2, Milano</indirizzo>
                <num_prodotti>18</num_prodotti>
            </record>
            <record>
                <codice_cliente>202</codice_cliente>
                <rag_soc>SkillNet</rag_soc>
                <codice_fiscale>IT887642131</codice_fiscale>
                <indirizzo tipo="ufficio">Via Chiasserini 11A, Milano</indirizzo>
                <num_prodotti>24</num_prodotti>
            </record>
            <record>
                <codice_cliente>12</codice_cliente>
                <rag_soc>Eidon</rag_soc>
                <codice_fiscale>IT04835710965</codice_fiscale>
                <indirizzo tipo="casa">Via Cignoli 17/2, Roma</indirizzo>
                <num_prodotti>1112</num_prodotti>
            </record>
            <record>
                <codice_cliente>5</codice_cliente>
                <rag_soc>Miami American Cafe</rag_soc>
                <codice_fiscale>IT07654930130</codice_fiscale>
                <indirizzo tipo="casa">Viale Carlo Espinasse 5, Como</indirizzo>
                <num_prodotti>13</num_prodotti> 
            </record>
            <record>
                <codice_cliente>302</codice_cliente>
                <rag_soc>Filiberto Gilardi</rag_soc>
                <codice_fiscale>IT87654770157</codice_fiscale>
                <indirizzo tipo="ufficio">Via Biancospini 20, Messina</indirizzo>
                <num_prodotti>8</num_prodotti>
            </record>
            <record>
                <codice_cliente>1302</codice_cliente>
                <rag_soc>Eidon</rag_soc>
                <codice_fiscale>IT887511231</codice_fiscale>
                <indirizzo tipo="ufficio">Via Bassini 17/2, Milano</indirizzo>
                <num_prodotti>18</num_prodotti>
            </record>
            <record>
                <codice_cliente>202</codice_cliente>
                <rag_soc>SkillNet</rag_soc>
                <codice_fiscale>IT887642131</codice_fiscale>
                <indirizzo tipo="ufficio">Via Chiasserini 11A, Milano</indirizzo>
                <num_prodotti>24</num_prodotti>
            </record>
            <record>
                <codice_cliente>202</codice_cliente>
                <rag_soc>SkillNet</rag_soc>
                <codice_fiscale>IT887642131</codice_fiscale>
                <indirizzo tipo="ufficio">Via Chiasserini 11A, Milano</indirizzo>
                <num_prodotti>24</num_prodotti>
            </record>
            <record>
                <codice_cliente>12</codice_cliente>
                <rag_soc>Eidon</rag_soc>
                <codice_fiscale>IT04835710965</codice_fiscale>
                <indirizzo tipo="casa">Via Cignoli 17/2, Roma</indirizzo>
                <num_prodotti>1112</num_prodotti>
            </record>
        </anagrafica>
    </result>
</response>
`

const xml2 = `
<response><result><info><time>0.0019500255584717</time></info><hospital><hid>972395</hid><name>しのぎ耳鼻咽喉科クリニック</name><zip>514-0046</zip><addr>三重県津市大園町10-49</addr><tel>059-213-8741</tel><subjects>耳鼻咽喉科</subjects><consultation_hours_1>月火水金土　9:00～12:00</consultation_hours_1><consultation_hours_2>月火水金　15:30～19:00　土　14:00～17:00</consultation_hours_2><consultation_hours_3></consultation_hours_3><closed>木・日・祝</closed><stations><station><station_name>津新町</station_name><line_name>近鉄名古屋線</line_name><dist>686m</dist></station></stations><hp_url></hp_url><lat>34.71518229</lat><long>136.49258789</long></hospital></result></response>
`

const root = parseXmlFromString(xml).documentElement;
const obj = valueToArray('result.hospital.stations.station', xmlToObject(root));
// console.log(obj);

const depth = (node, result = {}, obj = {}) => {
    if (node.childNodes.length === 0) return result;
    const n = isEmpty(result) ? result : obj;
    if(node.childNodes.length === 1 && node.childNodes[0].childNodes[0].nodeType === Node.TEXT_NODE) {
        n[node.childNodes[0].nodeName] = node.childNodes[0].childNodes[0].data;
        return result;
    }
    n[node.childNodes[0].nodeName] =  {};
    return depth(node.childNodes[0], result, n[node.childNodes[0].nodeName])
}

const order = (node) => {
    if (node.childNodes.length === 0) return undefined;
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) return node.childNodes[0].data;
    return reduce( (a, [k, v]) => {
        (k !== "#text") && 
        (a[k] = v.length === 1 ? order(v[0]) : map(order, v));
        return a;
    },{}, toPairs(groupBy('nodeName', node.childNodes)));
}

console.log(order(root));
