const net = require("net");

app.get("/", (req, res) => {
    const socket = new net.Socket();

    socket.setTimeout(10000);

    socket.connect(587, "smtp.gmail.com", () => {
        socket.destroy();
        res.send("SMTP reachable");
    });

    socket.on("timeout", () => {
        socket.destroy();
        res.status(500).send("SMTP timeout");
    });

    socket.on("error", (err) => {
        res.status(500).send(err.message);
    });
});