import { useState } from "react";

import "./Review.css"

const Review = () => {

	const [showBack, setShowBack] = useState(false)

	return (
		<div className="CardView">
			<div>
				<div>
					<div>
						{

							showBack ?
								<>
									<p className="Centrado">Lo mismo que por delante</p>
									<p className="Centrado">Y su traducción</p>
								</>
								:
								<>
									<p className="Centrado">Palabra en ingles</p>
									<p className="Centrado">Podemos poner una frase de ejemplo sacada de las historias</p>
								</>
						}

					</div>
				</div>
			</div>


			<div className="ButtonView">

				{
					showBack ?
						<>
							<button onClick={() => setShowBack(false)} style={{ fontSize: "3em", width: "7em", backgroundColor: "red", borderTopLeftRadius: "25px", borderBottomLeftRadius: "25px" }}>Mal</button>
							<button onClick={() => setShowBack(false)} style={{ fontSize: "3em", width: "7em", backgroundColor: "grey" }}>Difícil</button>
							<button onClick={() => setShowBack(false)} style={{ fontSize: "3em", width: "7em", backgroundColor: "green" }}>Bien</button>
							<button onClick={() => setShowBack(false)} style={{ fontSize: "3em", width: "7em", backgroundColor: "blue", borderTopRightRadius: "25px", borderBottomRightRadius: "25px" }}>Fácil</button>
						</> :
						<button onClick={() => setShowBack(true)} style={{ fontSize: "3em", paddingLeft: "1em", paddingRight: "1em", backgroundColor: "rgb(2, 48, 71)", borderRadius: "25px" }}>Mostrar respuesta</button>
				}

			</div>
		</div >
	)

}

export default Review;