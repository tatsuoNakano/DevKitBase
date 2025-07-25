import React from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import Layout from "../components/Common/Layout";

const SETTINGS_KEY = "devkitbase-settings-data";

const SettingsPage: React.FC = () => {
    const handleDownload = () => {
        const allKeys = Object.keys(localStorage);
        const data: Record<string, any> = {};
        allKeys.forEach((key) => {
            try {
                data[key] = JSON.parse(localStorage.getItem(key) || "null");
            } catch {
                data[key] = localStorage.getItem(key);
            }
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "devkitbase_data_backup.json";
        a.click();

        URL.revokeObjectURL(url);
    };
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);

                // ✅ 先にデータ全削除（古い壊れたキーを防ぐ）
                if (!window.confirm("すべてのデータを上書きします。続けますか？")) return;
                localStorage.clear();

                // ✅ 各キーごとに型を見て保存方法を分岐
                Object.keys(json).forEach((key) => {
                    const value = json[key];

                    if (typeof value === "string") {
                        // ダブルエンコード対策：\\n → \n
                        const fixedValue = value.replace(/\\n/g, "\n");
                        localStorage.setItem(key, fixedValue);
                    } else {
                        // 非文字列（オブジェクトなど）はJSONとして保存
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                });

                alert("インポートが完了しました。ページをリロードしてください。");
                window.location.reload(); // 任意：即座に反映されるようにする
            } catch (error) {
                console.error("JSON読み込みエラー:", error);
                alert("不正なJSONファイルです。");
            }
        };

        reader.readAsText(file);
    };


    const handleReset = () => {
        if (window.confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
            localStorage.clear();
            alert("ローカルストレージをリセットしました。ページをリロードしてください。");
        }
    };

    return (
        <Layout>
            <Container className="py-5">

                <Card className="bg-dark text-light border-secondary shadow-lg mb-4">
                    <Card.Body>
                        <h4 className="mb-3">データ管理</h4>

                        <div className="d-flex flex-column align-items-start gap-3">

                            <Button variant="outline-success" onClick={handleDownload}>
                                JSONとして全てのデータを保存
                            </Button>

                            <Form.Label className="btn btn-outline-info m-0">
                                保存したデータJSONを読み込む
                                <Form.Control
                                    type="file"
                                    accept=".json"
                                    onChange={handleUpload}
                                    className="d-none"
                                />
                            </Form.Label>

                            <Button variant="outline-danger" onClick={handleReset}>
                                データをすべて削除
                            </Button>

                        </div>

                        <p className="mt-3 text-muted fs-6">
                            保存されるデータには、全ToDo、メモ、チャート情報などが含まれます。
                        </p>
                    </Card.Body>
                </Card>


                <Card className="bg-dark text-light border-secondary shadow">
                    <Card.Body>
                        <h5 className="text-light">バージョン: 3.0.0</h5>
                    </Card.Body>
                </Card>
            </Container>
        </Layout>
    );
};

export default SettingsPage;
