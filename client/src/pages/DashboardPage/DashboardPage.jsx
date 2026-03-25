import { useState } from "react";

// Sections
import { DashboardMain } from "../../sections/dashboard/DashboardMain";
import { IngresosDetail } from "../../sections/dashboard/IngresosDetail";
import { OrdenesDetail } from "../../sections/dashboard/OrdenesDetail";


export function DashboardPage() {
	const [view, setView] = useState("main");

	if (view === "ingresos") {
		return <IngresosDetail onBack={() => setView("main")} />;
	}

	if (view === "ordenes") {
		return <OrdenesDetail onBack={() => setView("main")} />;
	}

	return (
		<DashboardMain
			onGoIngresos={() => setView("ingresos")}
			onGoOrdenes={() => setView("ordenes")}
		/>
	);
}