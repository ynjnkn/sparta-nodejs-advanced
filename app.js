const express = require("express");

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
    res.send("/api 라우터 동작 확인");
});
app.use("/api", express.json(), router);
app.use(express.static('./assets'));

app.listen(8080, () => {
    console.log("서버 실행 @ 포트 8080");
})