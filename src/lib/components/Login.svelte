<script lang="ts">
	import {
		Row,
		Column,
		FluidForm,
		Modal,
		Button,
		ButtonSet,
		InlineLoading
	} from 'carbon-components-svelte';
	import Input from '$lib/components/Input/Input.svelte';
	import { req } from '$lib/req';
	import { newUser, token, loginOpen } from '$lib/stores';

	$: if ($newUser) {
		userText = 'Login instead';
	} else {
		userText = 'Join instead';
	}

	let userText: string;

	let usernameInvalid = false;
	let username: string;
	let usernameError: string;

	let usernameRef;
	let passwordRef;
	let emailRef;

	let error: string;

	let passwordInvalid = false;
	let password: string;
	let passwordError: string;

	let emailInvalid = false;
	let emailError = 'Invalid Email';
	let email: string;

	let resetPasswordLoading;
	let resetPasswordRes;
	let loading: boolean;

	let noPassword: boolean;
	let noPasswordModal: boolean;

	/*const checkNoPassword = async() => {
        let noUserPassword = await api.get(`users/check-no-password/${username}`).then(r => r.res)
        return noUserPassword
    }*/

	const keydown = async (e) => {
		switch (e.keyCode) {
			case 13:
				await send();
		}
	};

	/*
    const validatePassword=()=>{
        if(password) passwordInvalid = false
        if(passwordRef) passwordRef.focus()
    }
    */

	const toggleNewUser = () => {
		$newUser = !$newUser;
	};

	const passwordResetTokenFeedback = (email) => {
		alert('password reset email sent'); //TODO
	};

	const resetPassword = async () => {
		resetPasswordLoading = true;
		if (!username) {
			usernameInvalid = true;
			usernameError = 'username required for password reset';
			return;
		}
		const res = await req({ User: { SendPasswordResetToken: username } })
			.then((r) => {
				if (r.error) {
					if (r.error.includes('username')) {
						usernameInvalid = true;
						usernameError = r.error;
					}
					return;
				} else {
					passwordResetTokenFeedback(email);
				}
			})
			.finally(() => {
				resetPasswordLoading = false;
			});
	};

	let include = `&include=${JSON.stringify(['username'])}`;

	const send = async () => {
		loading = true;
		if ($newUser && !email) {
			emailInvalid = true;
			emailError = 'Empty';
			loading = false;
			return;
		}
		if (!username) {
			usernameInvalid = true;
			usernameError = 'Empty';
			loading = false;
			return;
		}
		if (!password /* && !await checkNoPassword()*/) {
			passwordInvalid = true;
			passwordError = 'Empty';
			loading = false;
			return;
		}
		usernameInvalid = false;
		passwordInvalid = false;
		emailInvalid = false;
		interface Body {
			username: string;
			password: string;
			email?: string;
		}
		let body: Body = { username, password };
		if ($newUser) body.email = email;
		let data = $newUser ? { User: { New: body } } : { User: { Token: body } };
		const r = await req(data)
			.then((r) => {
				console.log(typeof r, r, r.error);
				if (r.error) {
					console.log(r.error);
					error = r.error;
					if (error.includes('email')) {
						emailInvalid = true;
						emailError = error;
						return;
					}
					if (error.includes('username')) {
						usernameInvalid = true;
						usernameError = error;
						return;
					}
					if (error.includes('password')) {
						passwordInvalid = true;
						passwordError = error;
						return;
					}
				}
				$token = r;
				$loginOpen = false;
				loading = false;
			})
			.finally(() => {
				loading = false;
			});
	};
</script>

<svelte:window on:keydown={keydown} />

<Modal
	danger
	bind:open={noPasswordModal}
	modalHeading="Create user account without a password"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--primary={() => {
		noPasswordModal = false;
		noPassword = true;
		// join();
	}}
	on:click:button--secondary={() => {
		noPasswordModal = false;
	}}
>
	<p>This will create a user account without a password, allowing anyone to access it. Continue?</p>
</Modal>

<svelte:head>
	<title>Login</title>
</svelte:head>

<Modal modalHeading="Authenticate" bind:open={$loginOpen} hasForm passiveModal hasScrollingContent>
	<Row>
		<Column>
			<FluidForm>
				{#if $newUser}
					<Input
						bind:invalid={emailInvalid}
						invalidText={emailError}
						bind:ref={emailRef}
						bind:value={email}
						labelText="Email"
						focus
					/>
				{/if}
				<Input
					bind:invalid={usernameInvalid}
					invalidText={usernameError}
					bind:value={username}
					bind:ref={usernameRef}
					labelText="Username"
					on:blur={/*checkNoPassword*/ () => {}}
				/>
				{#if !noPassword}
					<Input
						bind:invalid={passwordInvalid}
						invalidText={passwordError}
						bind:value={password}
						labelText="Password"
						bind:ref={passwordRef}
						password
					/>
				{/if}
				<ButtonSet stacked>
					<Button as let:props>
						<div on:click={send} {...props}>
							<p>{$newUser ? 'Join' : 'Login'}</p>
							{#if loading}
								<div class="right">
									<InlineLoading />
								</div>
							{/if}
						</div>
					</Button>
					<Button kind="ghost" as let:props>
						<div on:click={resetPassword} {...props}>
							<p>Reset Password</p>
							{#if resetPasswordLoading}
								<div class="right">
									<InlineLoading />
								</div>
							{/if}
						</div>
					</Button>
					<Button kind="ghost" size="small" on:click={toggleNewUser}>
						{userText}
					</Button>
				</ButtonSet>
			</FluidForm>
		</Column>
	</Row>
</Modal>

<style>
	@font-face {
		font-family: round;
		src: url('/junegull.ttf');
	}
	#head {
		font-family: round;
	}
	.right {
		float: right;
	}
</style>
