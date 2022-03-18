const Achivements = () => {
    let achivements = [
        { name: "", description: "Repasa 7 días seguidos", progres: 5, total: 7 },
        { name: "", description: "No te saltes ningun repaso durante un mes", progres: 2, total: 30 },
        { name: "", description: "Aprende 20 palabras", progres: 35, total: 20 },
        { name: "", description: "Aprende 50 palabras", progres: 35, total: 50 },
        { name: "", description: "Aprende 100 palabras", progres: 35, total: 100 },
    ]

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2em" }}>
            {
                achivements.map((e) => {
                    const p = Math.min(e.progres, e.total);

                    return <div key={e.description}>
                        <h4>{e.name}</h4>
                        <p>{e.description}</p>
                        <div style={{ display: "flex" }}>
                            <div style={{ width: "80%", backgroundColor: "red", borderRadius: "25px" }}>
                                <div style={{ width: (p / e.total * 100) + "%", height: "100%", borderRadius: "25px", backgroundColor: "chartreuse" }}>
                                </div>
                            </div>
                            <div style={{ width: "20%", textAlign: "center" }}>
                                {p === e.total ? "Completado" : p + "/" + e.total}
                            </div>
                        </div>

                    </div>
                })
            }
        </div>
    )

}

export default Achivements;