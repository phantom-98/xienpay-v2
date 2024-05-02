/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  const permissionMap = new Map(
    currentUser?.permissions?.map((permission: string) => {
      let toks = permission.split(/[-._]/);
      return [`can${toks.map((tok) => tok.charAt(0).toUpperCase() + tok.slice(1)).join('')}`, true];
    }),
  );

  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    ...Object.fromEntries(permissionMap.entries()),
  };
}
