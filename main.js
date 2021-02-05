import childProcess from 'child_process'

export {default as arg} from 'arg'

export * from 'kleur/colors'

export const spawn = (strs, ...quoted) =>
  new Promise((resolve) => {
    const args = []

    for (let i = 0; i < strs.length; i++) {
      args.push(...strs[i].split(' '))

      if (quoted[i] != null) {
        args.push(quoted[i])
      }
    }

    const spawned = childProcess.spawn(args[0], args.slice(1), {
      stdio: 'inherit'
    })

    spawned.on('exit', () => {
      resolve()
    })
  })
