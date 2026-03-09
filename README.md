<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>Laborator Programare Web</title>
</head>
<body bgcolor="#f4f7f6">

    <center>
        <h1>Desktop Virtual</h1>
        <img src="https://cdn-icons-png.flaticon.com/512/3606/3606645.png" 
             alt="Imagine Desktop" 
             width="100" 
             height="100" 
             title="desktop">
    </center>

    <hr>

    <div align="left">
        <p>Aplicatia Web va permite stocarea fisierelor intr-un "Desktop Virtual". Aceste desktop poate fi interactionat de mai multi utilizatori si ofera posibilitatea
            de a incarca / sterge / muta fisiere prin <span style="font-family: monospace;">WebSockets</span>.
        </p>
    </div>

    <h2>Caracteristici de baza:</h2>
    <ul>
        <h3> 
            <li>Mutarea obiectelor prin Drag and Drop.</li>
        </h3>
        <h3>
            <li>Suporta fisiere de baza: .txt, .jpg, .png</li>
        </h3>
    </ul>

    <br />

    <table border="1" width="100%" bgcolor="#ffffff">
        <tr>
            <th colspan="2" align="center" bgcolor="#dddddd">Roadmap</th>
        </tr>
        <tr valign="middle">
            <td width="50%" align="center"><b>Week</b></td>
            <td width="50%" align="center"><b>Goal</b></td>
        </tr>
        <tr valign="middle">
            <td width="30%" align="center">Week 3</td>
            <td width="30%" align="center">Pagina de logare</td> 
        </tr>
    </table>

    <br />

    <fieldset>
        <legend><b>Tehnologi folosite</b></legend>
        <form action="#" method="post">
            
            <label>MongoDB</label>
            <br />
            <label>Framework:</label>
            <select name="modes" multiple size="2">
                <option value="edit" selected>Express.js</option>
                <option value="view">Nest.js</option>
                <option value="admin">Elysia.js</option>
            </select> 
        </form>
    </fieldset>
</body>
</html>
