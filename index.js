const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/buscar-vagas', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.99freelas.com.br/projects?fs=t&sb=best_match&st=remote', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const vagas = await page.evaluate(() => {
      const lista = [];
      document.querySelectorAll('.project-item').forEach((el) => {
        const linkTag = el.querySelector('a');
        const href = linkTag ? linkTag.getAttribute('href') : null;

        lista.push({
          plataforma: '99Freelas',
          vaga: el.querySelector('h3')?.innerText.trim() || 'Não informado',
          salario: el.querySelector('.value')?.innerText.trim() || 'A combinar',
          local: 'Remoto',
          descricao: el.querySelector('.description')?.innerText.trim().slice(0, 100) + '...' || '',
          link: href ? 'https://www.99freelas.com.br' + href : ''
        });
      });
      return lista;
    });

    await browser.close();
    res.json(vagas);
  } catch (err) {
    console.error('Erro ao buscar vagas:', err);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando na porta 3000');
});
