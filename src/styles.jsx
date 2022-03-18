import { createStyles } from '@mantine/core'

const useStyles = createStyles(theme => {

	const icon_width = "8vw"

	return {
		page: {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
		},
		sidebar: {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
			width: icon_width,
			height: "100vh",
			padding: "0.7em",
			position: "fixed",
			top: "0px",
			left: "0px",
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-evenly",
		},
		icon: {
			width: icon_width
		}
	}
})

export default useStyles