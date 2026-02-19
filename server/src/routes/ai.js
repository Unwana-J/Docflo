const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config');

const router = express.Router();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

router.post('/detect-fields', async (req, res) => {
    try {
        const { fileData, mimeType } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = "Analyze this document image and identify all data fields that should be dynamic (e.g., names, dates, amounts, etc.). Return a JSON array of fields with name, type (TEXT, DATE, NUMBER, CURRENCY), and bounding box rect (ymin, xmin, ymax, xmax) in 0-1000 coordinates. Also suggest a title for this template.";

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: fileData, mimeType } }
        ]);

        const text = result.response.text();
        const jsonStr = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)?.[0] || text;
        const data = JSON.parse(jsonStr);

        res.json(data);
    } catch (err) {
        console.error("AI Detect Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/suggest-mapping', async (req, res) => {
    try {
        const { fieldList, headerList } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `I have a template with these fields: [${fieldList}]. 
    I have a CSV with these headers: [${headerList}].
    Please map each template field to the most likely CSV header.
    Return a JSON object where keys are template fields and values are CSV headers. If no match, use null.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
        const data = JSON.parse(jsonStr);

        res.json(data);
    } catch (err) {
        console.error("AI Mapping Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
